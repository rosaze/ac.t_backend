//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가
const mongoose = require('mongoose'); // mongoose 모듈 가져오기
const Vendor = require('../models/Vendor');
const PostService = require('./PostService'); // 감정 분석 서비스를 가져옵니다.
const SearchHistory = require('../models/SearchHistory'); // 검색 기록 모델 (필요시 생성)
const ActivityRecommendationService = require('./activityRecommendationService');
const locations = require('../utils/location');
const User = require('../models/User');
const activities = require('../utils/activity.json').activities;
const AccommodationService = require('./AccommodationService');
const WeatherRecommendationService = require('./WeatherRecommendationService');
const postService = new PostService(); // Instantiate PostService
const apiClient = require('../utils/apiClient');

function safeStringify(obj, indent = 2) {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) return '[Circular]';
        cache.push(value);
      }
      if (value instanceof RegExp) return value.toString();
      return value;
    },
    indent
  );
  cache = null;
  return retVal;
}

function normalizeLocationName(name) {
  if (!name) return ''; // 빈 문자열 반환
  return name.replace(/(시|군)$/, '');
}

//검색 기능 추가
class VendorService {
  async addVendor(name) {
    try {
      // 로그 추가: 입력 값 확인
      console.log('addVendor called with name:', name);

      const existingVendor = await Vendor.findOne({ title: name }).exec();

      if (existingVendor) {
        console.log('Vendor already exists:', existingVendor);
        return existingVendor;
      }

      const vendor = new Vendor({ title: name });
      const savedVendor = await vendor.save();

      console.log('New vendor added:', savedVendor);
      return savedVendor;
    } catch (error) {
      console.error('Error in addVendor:', error);
      throw error;
    }
  }

  // 특정 장소에 대한 감정 분석 결과를 가져옴
  async getVendorDetailsAndSentiments(vendorId) {
    const vendor = await Vendor.findById(vendorId).exec();
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    // PostService를 이용하여 감정 분석을 수행
    let sentimentAnalysis;
    try {
      sentimentAnalysis = await postService.analyzeSentiments(vendor.title);
    } catch (error) {
      console.error('Error analyzing sentiments:', error);
      sentimentAnalysis = { error: 'Failed to analyze sentiments' };
    }

    return {
      vendor,
      sentimentAnalysis,
    };
  }
  catch(error) {
    console.error('Error in getVendorDetailsAndSentiments:', error);
    throw error;
  }

  // ------------------------------------------------------------------------------
  // 사용자 선호도 분석한 결과 바탕 --> 특정 시군에서의 장소 집계하여 반환
  // ActivityAnalysisService 사용 :특정 사용자에 대한 맞춤형 추천 장소를 시군별로 집계
  // 사용자 선호도 분석 결과를 바탕으로 특정 시군에서 장소를 집계하여 반환
  async getCustomVendorsByRegion(userId, isCustomRecommendation) {
    let query = {};

    // 맞춤형 추천 활성화 시 사용자 선호도를 반영한 필터링 조건 구성
    if (isCustomRecommendation) {
      // 사용자 활동 기록을 반영하지 않고 선호도만을 고려한 추천
      const recommendedActivities =
        await ActivityRecommendationService.recommendActivitiesByPreference(
          userId
        );

      // 사용자 선호도 기반 필터링 조건
      query = {
        activityType: { $in: recommendedActivities },
      };
    }

    // 시군별 장소 집계
    const pipeline = [
      { $match: query },
      { $group: { _id: '$sigungu', count: { $sum: 1 } } }, // 시군별로 장소 수 집계
      { $match: { _id: { $in: locations } } }, // 강원도 내 시군구와 매칭
      { $sort: { count: -1 } }, // 결과를 장소 수에 따라 내림차순 정렬
    ];

    return await Vendor.aggregate(pipeline).exec();
  }

  async getVendorsByCategoryAndRegion(
    category,
    region,
    userId,
    isCustomRecommendation
  ) {
    try {
      let query = {};
      let recommendedActivities = [];

      console.log(
        `getVendorsByCategoryAndRegion called with: category=${category}, region=${region}, userId=${userId}, isCustomRecommendation=${isCustomRecommendation}`
      );

      if (!category && region) {
        // 지역만 선택된 경우
        console.log(`Requesting recommendation for location: ${region}`);
        const response = await apiClient.post('/recommend/by_location', {
          location: region,
        });
        recommendedActivities = response.data.recommended_activities;
        console.log(`Received recommended activities:`, recommendedActivities);
        query = { sigungu: { $regex: new RegExp(region, 'i') } };
      } else if (category) {
        // 카테고리가 선택된 경우 (지역 선택 여부 상관없음)
        query = {
          ...(region && { sigungu: { $regex: new RegExp(region, 'i') } }),
          $or: [
            { category1: { $regex: new RegExp(category, 'i') } },
            { category2: { $regex: new RegExp(category, 'i') } },
            { category3: { $regex: new RegExp(category, 'i') } },
          ],
        };
      } else if (!category && region) {
        // 지역만 선택된 경우
        console.log(`Requesting recommendation for location: ${region}`);
        const response = await apiClient.post('/recommend/by_location', {
          location: region,
        });
        recommendedItems = response.data.recommended_activities;
        console.log(`Received recommended activities:`, recommendedItems);
        query = { sigungu: { $regex: new RegExp(region, 'i') } };
      } else if (category && region) {
        // 카테고리와 지역 모두 선택된 경우
        console.log(
          `Both category and region selected. No weather recommendation requested.`
        );
        query = {
          sigungu: { $regex: new RegExp(region, 'i') },
          $or: [
            { category1: { $regex: new RegExp(category, 'i') } },
            { category2: { $regex: new RegExp(category, 'i') } },
            { category3: { $regex: new RegExp(category, 'i') } },
          ],
        };
      }

      if (isCustomRecommendation) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const userPreferences = user.preference;
        console.log('User Preferences:', safeStringify(userPreferences));

        // 사용자 선호도에 맞는 액티비티 필터링
        const recommendedActivities = activities.filter(
          (activity) =>
            (activity.location === userPreferences.location ||
              userPreferences.location === 'both') &&
            (activity.environment === userPreferences.environment ||
              userPreferences.environment === 'both') &&
            (activity.group === userPreferences.group ||
              userPreferences.group === 'both') &&
            (activity.season === userPreferences.season ||
              activity.season === 'both' ||
              userPreferences.season === 'both')
        );

        const activityNames = recommendedActivities.map(
          (activity) => activity.name
        );

        // 기존 쿼리와 선호도 기반 필터 조건 결합
        query = {
          ...query,
          $and: [
            {
              $or: [
                { category1: { $in: activityNames } },
                { category2: { $in: activityNames } },
                { category3: { $in: activityNames } },
                { contenttype: { $in: activityNames } },
              ],
            },
          ],
        };
      }

      console.log('Query:', safeStringify(query));
      const results = await Vendor.find(query).exec();
      console.log('Results before sorting:', results.length);

      // 날씨 추천 순으로 정렬
      if (recommendedActivities.length > 0) {
        console.log('Sorting results based on weather recommendations');
        const sortedResults = results.sort((a, b) => {
          const scoreA = this.getRecommendationScore(a, recommendedActivities);
          const scoreB = this.getRecommendationScore(b, recommendedActivities);
          return scoreB - scoreA;
        });
        console.log('Results after sorting:', sortedResults.length);
        return sortedResults;
      } else {
        console.log(
          'No weather recommendations available. Returning unsorted results.'
        );
        return results;
      }
    } catch (error) {
      console.error('Error in getVendorsByCategoryAndRegion:', error);
      throw error;
    }
  }

  getRecommendationScore(vendor, recommendedActivities) {
    const matchingActivity = recommendedActivities.find(
      (item) => item.activity.toLowerCase() === vendor.category3.toLowerCase()
    );
    return matchingActivity ? matchingActivity.score : -Infinity;
  }

  async searchActivities(keyword, userId, isCustomRecommendation = false) {
    console.log(
      'searchActivities 시작 - 키워드:',
      keyword,
      '사용자 ID:',
      userId,
      '맞춤 추천 여부:',
      isCustomRecommendation
    );

    const isLocationSearch = this.isLocation(keyword);
    console.log('isLocationSearch:', isLocationSearch);
    let query = this.buildBaseQuery(keyword, isLocationSearch);
    console.log('생성된 쿼리:', query);

    let weatherRecommendation;
    if (isLocationSearch && isCustomRecommendation && userId) {
      console.log('Requesting location-based recommendation');
      weatherRecommendation =
        await WeatherRecommendationService.getRecommendationByLocation(keyword);
    } else {
      console.log('Requesting activity-based recommendation');
      weatherRecommendation =
        await WeatherRecommendationService.getRecommendationByActivity(keyword);
    }

    let recommendedActivities =
      weatherRecommendation.recommended_activities.map((a) => a.activity);
    console.log('날씨 기반 추천 액티비티:', recommendedActivities);

    if (isCustomRecommendation && userId) {
      console.log('Applying custom recommendations for user:', userId);
      const userPreferences =
        await ActivityRecommendationService.recommendActivitiesByPreference(
          userId
        );
      recommendedActivities = this.filterActivitiesByUserPreference(
        weatherRecommendation.recommended_activities,
        userPreferences
      );
      query = this.addPreferenceFilter(query, recommendedActivities);
    } else {
      console.log('No custom recommendations applied');
    }

    const vendors = await Vendor.find(query).exec();
    console.log('검색된 장소들:', vendors.length);

    let result = vendors;

    // 위치 검색일 경우 단일 위치에 대한 필터링 적용
    if (isLocationSearch) {
      const normalizedKeyword = normalizeLocationName(keyword);
      result = result.filter(
        (vendor) => normalizeLocationName(vendor.sigungu) === normalizedKeyword
      );
    }

    // 날씨 기반 추천 활동으로 정렬
    result = this.sortVendorsByRecommendation(result, recommendedActivities);

    // 각 vendor에 대한 추천 날짜 정보 추가
    for (let vendor of result) {
      vendor.recommendedDates = await this.getRecommendedDatesForActivity(
        vendor.sigungu,
        vendor.category3 || vendor.category2 || vendor.contenttype
      );
    }

    console.log('최종 결과:', result.length);
    console.log('정렬된 추천 활동:', recommendedActivities);

    return result;
  }

  sortVendorsByRecommendation(vendors, recommendedActivities) {
    const activityOrder = recommendedActivities.reduce(
      (acc, activity, index) => {
        acc[activity.toLowerCase()] = index;
        return acc;
      },
      {}
    );

    return vendors.sort((a, b) => {
      const orderA =
        activityOrder[(a.category3 || '').toLowerCase()] ?? Infinity;
      const orderB =
        activityOrder[(b.category3 || '').toLowerCase()] ?? Infinity;
      return orderA - orderB;
    });
  }

  filterActivitiesByUserPreference(activities, userPreferences) {
    console.log('Filtering activities by user preference');

    const activityScores = activities.reduce((acc, activity) => {
      acc[activity.activity.toLowerCase()] = activity.score;
      return acc;
    }, {});

    // 사용자 선호도를 날씨 기반 점수로 정렬
    return userPreferences
      .map((pref) => ({
        activity: pref,
        score: activityScores[pref.toLowerCase()] || -Infinity,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.activity);
  }

  addPreferenceFilter(query, userPreferences) {
    console.log('Adding preference filter to query');
    return {
      ...query,
      $or: [
        ...(query.$or || []),
        { category3: { $in: userPreferences } },
        { category2: { $in: userPreferences } },
        { contenttype: { $in: userPreferences } },
      ],
    };
  }

  isLocation(keyword) {
    return locations.includes(keyword);
  }

  buildBaseQuery(keyword, isLocationSearch) {
    if (isLocationSearch) {
      return { sigungu: keyword };
    } else {
      return {
        $or: [
          { category3: { $regex: keyword, $options: 'i' } },
          { category2: { $regex: keyword, $options: 'i' } },
          { category1: { $regex: keyword, $options: 'i' } },
          { contenttype: { $regex: keyword, $options: 'i' } },
        ],
      };
    }
  }

  combineResultsWithRecommendation(
    vendors,
    recommendedActivities,
    isLocationSearch,
    keyword
  ) {
    if (recommendedActivities.length === 0) {
      return vendors.map((vendor) => ({
        id: vendor._id,
        title: vendor.title,
        sigungu: vendor.sigungu,
        contenttype: vendor.contenttype,
        category3: vendor.category3,
      }));
    }

    const result = [];
    for (const activity of recommendedActivities) {
      const matchingVendors = vendors.filter((vendor) =>
        isLocationSearch
          ? vendor.category3 === activity ||
            vendor.category2 === activity ||
            vendor.contenttype === activity
          : vendor.sigungu === keyword
      );

      if (matchingVendors.length > 0) {
        result.push({
          activity: activity,
          vendors: matchingVendors.map((vendor) => ({
            id: vendor._id,
            title: vendor.title,
            sigungu: vendor.sigungu,
            contenttype: vendor.contenttype,
            category3: vendor.category3,
          })),
        });
      }
    }
    return result.length > 0
      ? result
      : vendors.map((vendor) => ({
          id: vendor._id,
          title: vendor.title,
          sigungu: vendor.sigungu,
          contenttype: vendor.contenttype,
          category3: vendor.category3,
        }));
  }

  async getRecommendedDatesForActivity(location, activity) {
    try {
      let weatherRecommendation;
      if (this.isLocation(location)) {
        weatherRecommendation =
          await WeatherRecommendationService.getRecommendationByLocation(
            location
          );
      } else {
        weatherRecommendation =
          await WeatherRecommendationService.getRecommendationByActivity(
            activity
          );
      }

      // 응답 구조 확인
      console.log(
        'Weather recommendation:',
        JSON.stringify(weatherRecommendation, null, 2)
      );

      let recommendedDates;
      if (this.isLocation(location)) {
        // 위치 기반 추천의 경우
        recommendedDates = weatherRecommendation.recommended_activities.find(
          (act) => act.activity.toLowerCase() === activity.toLowerCase()
        )?.recommended_dates;
      } else {
        // 활동 기반 추천의 경우
        recommendedDates = weatherRecommendation.recommended_dates?.[activity];
      }

      if (Array.isArray(recommendedDates)) {
        return recommendedDates.sort((a, b) => b.score - a.score);
      } else {
        console.log(
          `No recommended dates found for ${activity} in ${location}`
        );
        return [];
      }
    } catch (error) {
      console.error('Error in getRecommendedDatesForActivity:', error);
      return [];
    }
  }
  //vendorController에서 안쓰이고 있음
  /* async searchActivitiesByKeywordWithRecommendation(keyword, userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const recommendedActivities =
        await ActivityRecommendationService.recommendActivitiesByPreference(
          userId
        );

      return await Vendor.find({
        $and: [
          {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { sigungu: { $regex: keyword, $options: 'i' } },
              { category2: { $regex: keyword, $options: 'i' } },
              { category3: { $regex: keyword, $options: 'i' } },
            ],
          },
          {
            $or: recommendedActivities.map((activity) => ({
              $or: [
                { category1: { $regex: activity, $options: 'i' } },
                { category2: { $regex: activity, $options: 'i' } },
                { category3: { $regex: activity, $options: 'i' } },
                { contenttype: { $regex: activity, $options: 'i' } },
              ],
            })),
          },
        ],
      }).exec();
    } catch (error) {
      console.error('searchActivitiesByKeywordWithRecommendation 오류:', error);
      throw error;
    }
  }*/

  // 사용자의 최근 검색 기록 가져오기
  async getSearchHistory(userId) {
    return await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }

  // 검색 기록을 저장
  async saveSearchHistory(userId, keyword) {
    try {
      // 여기서 userId가 실제로 존재하는지, 올바른지 확인합니다.
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid or missing userId');
      }

      // userId를 ObjectId로 변환하여 저장
      const searchRecord = new SearchHistory({
        user: new mongoose.Types.ObjectId(userId), // 변환된 ObjectId 사용
        keyword: keyword,
        createdAt: new Date(),
      });

      await searchRecord.save();
      return searchRecord;
    } catch (error) {
      console.error('Error saving search history:', error.message);
      throw error;
    }
  }
  async getVendorDetailsWithAccommodations(vendorId) {
    const vendorDetails = await this.getVendorDetailsAndSentiments(vendorId);
    const accommodationCounts =
      await AccommodationService.getAccommodationInfoBySigungu(
        vendorDetails.vendor.sigungu
      );

    return {
      ...vendorDetails,
      accommodationCounts,
    };
  }
  catch(error) {
    console.error('Error in getVendorDetailsWithAccommodations:', error);
    throw new Error(
      '업체 상세 정보 및 숙박 정보를 가져오는 중 오류가 발생했습니다.'
    );
  }
}

module.exports = new VendorService();
