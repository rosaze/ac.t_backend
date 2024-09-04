const VendorService = require('../services/VendorService');
const ActivityRecommendationService = require('../services/activityRecommendationService'); // 활동 추천 서비스

const WishlistService = require('../services/WishlistService'); //찜
const SearchHistoryService = require('../services/SearchHistoryService');

class VendorController {
  // 검색 기능 (온/오프 토글 적용)
  async searchVendors(req, res) {
    try {
      const keyword = req.query.q;
      const isCustomRecommendation = req.query.custom === 'true'; // 맞춤형 추천 여부 확인
      const userId = req.params.userId;

      const vendors = await VendorService.searchActivitiesByKeyword(
        keyword,
        userId,
        isCustomRecommendation
      );
      res.status(200).json(vendors);
    } catch (err) {
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
      res
        .status(500)
        .json({
          message: 'Failed to retrieve vendors by region',
          error: err.message,
        });
    }
  }

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

  // 특정 시군의 장소(업체) 리스트를 반환
  async getVendorsByCategoryAndRegion(req, res) {
    try {
      const { category, region } = req.query;
      const isCustomRecommendation = req.query.custom === 'true'; // 맞춤형 추천 여부 확인(토클)
      const userId = req.params.userId;

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
      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // 사용자 맞춤형 추천과 검색 기록 제공
  async getInitialSearchData(req, res) {
    const userId = req.user._id; // 사용자의 ID (로그인된 사용자 기준)

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
}

module.exports = new VendorController();
