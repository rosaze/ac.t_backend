//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가
const mongoose = require('mongoose'); // mongoose 모듈 가져오기
const Vendor = require('../models/Vendor');
const PostService = require('./PostService'); // 감정 분석 서비스를 가져옵니다.
const SearchHistory = require('../models/SearchHistory'); // 검색 기록 모델 (필요시 생성)
const ActivityRecommendationService = require('./activityRecommendationService');
const locations = require('../utils/location');
const User = require('../models/user');
const activities = require('../utils/activity.json').activities;
const AccommodationService = require('./AccommodationService');
const WeatherRecommendationService = require('./WeatherRecommendationService');
const postService = new PostService(); // Instantiate PostService

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

  // 키워드를 통해 장소 검색
  async searchActivitiesByKeyword(keyword) {
    return await Vendor.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { addr1: { $regex: keyword, $options: 'i' } },
        { sigungu: { $regex: keyword, $options: 'i' } },
        { contenttype: { $regex: keyword, $options: 'i' } },
        { category1: { $regex: keyword, $options: 'i' } },
        { category2: { $regex: keyword, $options: 'i' } },
        { category3: { $regex: keyword, $options: 'i' } },
      ],
    }).exec();
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
      // 기본 검색 조건
      let query = {
        sigungu: { $regex: new RegExp(region, 'i') },
        $or: [
          { category1: { $regex: new RegExp(category, 'i') } },
          { category2: { $regex: new RegExp(category, 'i') } },
          { category3: { $regex: new RegExp(category, 'i') } },
        ],
      };

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
      console.log('Results:', results.length);
      return results;
    } catch (error) {
      console.error('Error in getVendorsByCategoryAndRegion:', error);
      throw error;
    }
  }

  // 키워드를 통해 장소 검색 (토글 기능 적용)
  async searchActivitiesByKeyword(keyword, userId, isCustomRecommendation) {
    // 기본 검색 조건: 키워드로 장소 검색
    let query = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { sigungu: { $regex: keyword, $options: 'i' } },
        { category2: { $regex: keyword, $options: 'i' } },
        { category3: { $regex: keyword, $options: 'i' } },
      ],
    };

    // 맞춤형 추천이 활성화된 경우, 사용자 선호도를 기반으로 필터링
    if (isCustomRecommendation) {
      // 사용자 선호도에 따른 추천 활동을 가져옴 (활동 기록 무시)
      const recommendedActivities =
        await ActivityRecommendationService.recommendActivitiesByPreference(
          userId
        );

      // 추천된 활동에 맞는 장소로 필터링
      if (recommendedActivities.length > 0) {
        query.contenttype = {
          $in: recommendedActivities.map((item) => item.name), // 선호도 기반 활동 필터링
        };
      }
    }

    // 검색 기록 저장 (키워드로 검색한 경우)
    //await this.saveSearchHistory(userId, keyword, 'keyword');

    return await Vendor.find(query).exec();
  }

  async searchActivitiesByKeywordWithRecommendation(keyword, userId) {
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
  }

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
