//사용자가 해시태그 입력시 해당 입력에 따라 자동으로 업체명 검색, 새롭게 추가
const mongoose = require('mongoose'); // Add this line at the top
const VendorService = require('../services/VendorService');
const AccommodationService = require('../services/AccommodationService');

class VendorController {
  async addVendor(req, res) {
    try {
      const name = req.body.name;
      const vendor = await VendorService.addVendor(name);
      res.status(201).json(vendor);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  // 장소 검색 기능
  async searchActivities(req, res) {
    const { keyword } = req.query;

    try {
      const vendors = await VendorService.searchActivitiesByKeyword(keyword);

      if (vendors.length === 0) {
        return res
          .status(404)
          .json({ message: '해당 키워드로 검색된 결과가 없습니다.' });
      }

      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({
        message: '검색 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
  // 특정 장소의 상세 정보 및 감정 분석 결과 제공 + 숙박 메서드 추가
  async getVendorDetails(req, res) {
    const { id } = req.params;

    try {
      const result = await VendorService.getVendorDetailsAndSentiments(id);
      const accommodationCounts =
        await AccommodationService.getAccommodationInfoBySigungu(
          vendorDetails.vendor.sigungu
        );

      res.status(200).json({
        ...vendorDetails,
        accommodationCounts,
      });
    } catch (error) {
      res.status(500).json({
        message: '업체 정보를 불러오는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  //검색 결과 저장 + 키워드 검색 처리
  async searchActivitiesByKeyword(req, res) {
    try {
      const keyword = req.query.keyword;
      const isCustomRecommendation = req.query.custom === 'true';
      const userId = req.user?.id;

      console.log('검색 파라미터:', {
        keyword,
        isCustomRecommendation,
        userId,
      });


      if (!keyword) {
        return res.status(400).json({ message: 'Keyword required' });
      }

      let vendors;
      if (isCustomRecommendation) {
        vendors =
          await VendorService.searchActivitiesByKeywordWithRecommendation(
            keyword,
            userId
          );
      } else {
        vendors = await VendorService.searchActivitiesByKeyword(keyword);
      }

      if (vendors.length === 0) {
        return res
          .status(404)
          .json({ message: 'No results found for the given keyword.' });
      }
      res.status(200).json(vendors);
    } catch (err) {
      console.error('searchActivitiesByKeyword 오류:', err);
      res.status(500).json({ message: err.message });
    }
  }

  // 사용자 맞춤형 추천 장소를 시군별로 집계하여 반환
  async getCustomVendorsByRegion(req, res) {
    try {
      const userId = req.params.userId;
      const isCustomRecommendation = req.query.custom === 'true'; // 맞춤형 추천 여부 확인

      // 맞춤형 장소를 시군별로 집계하는 서비스 호출
      const vendorsCount = await VendorService.getCustomVendorsByRegion(
        userId,
        isCustomRecommendation
      );

      // 결과 반환
      res.status(200).json(vendorsCount);
    } catch (err) {
      console.error('Error in getCustomVendorsByRegion:', err);
      res.status(500).json({
        message: 'Failed to retrieve vendors by region',
        error: err.message,
      });
    }
  }
  /*기존 getvendorDetails 존재
  // 특정 장소의 상세 정보 및 감정 분석 결과 제공
  async getVendorDetails(req, res) {
    const { id } = req.params;

    try {
      const result = await VendorService.getVendorDetailsAndSentiments(id);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: '업체 정보를 불러오는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
    */

  // 특정 시군의 장소(업체) 리스트를 반환
  async getVendorsByCategoryAndRegion(req, res) {
    try {
      const { category, region } = req.query;
      const userId = req.params.userId;
      const isCustomRecommendation = req.query.custom === 'true';

      if (!category || !region) {
        return res
          .status(400)
          .json({ message: 'Category and region are required' });
      }

      const vendors = await VendorService.getVendorsByCategoryAndRegion(
        category,
        region,
        userId,
        isCustomRecommendation
      );

      console.log('Vendors found:', vendors.length);
      res.status(200).json(vendors);
    } catch (err) {
      console.error('Error in getVendorsByCategoryAndRegion:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
  /*
  // 사용자 맞춤형 추천과 검색 기록 제공
  async getInitialSearchData(req, res) {
    const userId = req.params.id; // 사용자의 ID (로그인된 사용자 기준)

    try {
      const recommendedVendors = await VendorService.getRecommendedVendors(
        userId
      );
      const searchHistory = await VendorService.getSearchHistory(userId);
      const recommendedActivities =
        await VendorService.getRecommendedActivities(userId);

      res
        .status(200)
        .json({ recommendedVendors, searchHistory, recommendedActivities });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to load search data', error: error.message });
    }
  }
    */

  // 사용자 검색 기록을 조회
  async getSearchHistory(req, res) {
    try {
      const userId = req.params.userId;
      const history = await VendorService.getSearchHistory(userId);
      res.status(200).json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getAccommodationInfo(req, res) {
    const { sigungu } = req.params;

    try {
      const accommodationCounts =
        await AccommodationService.getAccommodationInfoBySigungu(sigungu);

      res.status(200).json({ accommodationCounts });
    } catch (error) {
      res.status(500).json({
        message: '숙박 시설 정보를 불러오는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
  async getAccommodationDetails(req, res) {
    const { sigungu } = req.params;
    const { category } = req.query;

    try {
      let result;
      if (category) {
        result =
          await AccommodationService.getAccommodationDetailsBySigunguAndCategory(
            sigungu,
            category
          );
      } else {
        result = await AccommodationService.getAllAccommodationDetailsBySigungu(
          sigungu
        );
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: '숙박 시설 상세 정보를 불러오는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
}

module.exports = new VendorController();
