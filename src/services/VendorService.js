//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가
const mongoose = require('mongoose'); // mongoose 모듈 가져오기
const Vendor = require('../models/Vendor');
const PostService = require('./PostService'); // 감정 분석 서비스를 가져옵니다.
const SearchHistory = require('../models/SearchHistory'); // 검색 기록 모델 (필요시 생성)
const ActivityRecommendationService = require('./activityRecommendationService');
const locations = require('../utils/location');

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
  // 시군별 숙박시설 검색 + 숙박 유형 필터링
  async getAccommodationsByRegion(region, category = null) {
    const query = {
      sigunguname: region, // 시군구 필드로 필터링
      contenttype: '숙박', // 숙박시설로 한정
    };
    if (category) {
      query['category3'] = category; // 특정 숙박 유형으로 필터링 (모텔, 펜션 등)
    }

    return await Vendor.find(query)
      .select('title addr1 firstimage description tel category3')
      .exec();
  }
  // 키워드를 통해 장소 검색
  async searchActivitiesByKeyword(keyword) {
    return await Vendor.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { addr1: { $regex: keyword, $options: 'i' } },
        { sigunguname: { $regex: keyword, $options: 'i' } },
        { contentype: { $regex: keyword, $options: 'i' } },
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
    const sentimentAnalysis = await PostService.analyzeSentiments(vendor.title);
    return {
      vendor,
      sentimentAnalysis,
    };
  }
  //[수정전] <액티비티 검색창> : 장소추천, 검색기록

  /*
  // 사용자 기반 추천 장소 제공
  async getRecommendedVendors(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }
  }
    */
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
      { $group: { _id: '$sigunguname', count: { $sum: 1 } } }, // 시군별로 장소 수 집계
      { $match: { _id: { $in: locations } } }, // 강원도 내 시군구와 매칭
      { $sort: { count: -1 } }, // 결과를 장소 수에 따라 내림차순 정렬
    ];

    return await Vendor.aggregate(pipeline).exec();
  }

  // 특정 카테고리와 시군에 해당하는 장소(업체) 데이터를 가져오기
  // 특정 카테고리와 시군에 해당하는 장소(업체) 데이터를 가져오기
  async getVendorsByCategoryAndRegion(
    category,
    region,
    userId,
    isCustomRecommendation
  ) {
    // 맞춤형 추천이 활성화된 경우, 사용자 선호도 및 활동 기록 기반으로 장소 추천
    if (isCustomRecommendation) {
      // 사용자 선호도를 가져옴 (활동 기록 무시)
      const recommendedActivities =
        await ActivityRecommendationService.recommendActivitiesByPreference(
          userId
        );

      // 추천된 활동에 맞는 장소로 필터링
      if (recommendedActivities.length > 0) {
        return Vendor.find({
          sigunguname: region,
          contenttype: { $in: recommendedActivities.map((item) => item.name) }, // contenttype 필드를 추천된 활동명과 비교
        }).exec();
      }

      // 추천된 활동이 없을 경우 빈 결과 반환
      return [];
    }

    // 기본 검색 조건: 특정 카테고리와 시군에 해당하는 장소 검색
    const query = {
      sigunguname: region,
      contenttype: category,
    };

    // 검색 기록 저장 (카테고리와 시군으로 검색한 경우)
    await this.saveSearchHistory(userId, category, 'category_region');

    return await Vendor.find(query).exec();
  }

  // 키워드를 통해 장소 검색 (토글 기능 적용)
  async searchActivitiesByKeyword(keyword, userId, isCustomRecommendation) {
    // 기본 검색 조건: 키워드로 장소 검색
    let query = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { addr1: { $regex: keyword, $options: 'i' } },
        { sigunguname: { $regex: keyword, $options: 'i' } },
        { contenttype: { $regex: keyword, $options: 'i' } },
        { category1: { $regex: keyword, $options: 'i' } },
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

  // 사용자의 최근 검색 기록 가져오기
  async getSearchHistory(userId) {
    return await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }
  /*
  // 검색 기록을 저장
  async saveSearchHistory(userId, keyword) {
    try {
      // 여기서 userId가 실제로 존재하는지, 올바른지 확인합니다.
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid or missing userId');
      }

      // userId를 ObjectId로 변환하여 저장
      const searchRecord = new SearchHistory({
        user: mongoose.Types.ObjectId(userId), // 변환된 ObjectId 사용
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
  */
}

module.exports = new VendorService();
