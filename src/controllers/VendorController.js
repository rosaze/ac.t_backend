//사용자가 해시태그 입력시 해당 입력에 따라 자동으로 업체명 검색, 새롭게 추가
const VendorService = require('../services/VendorService');

const ActivityRecommendationService = require('../services/activityRecommendationService'); // 활동 추천 서비스

const WishlistService = require('../services/WishlistService'); //찜
const SearchHistoryService = require('../services/SearchHistoryService');

exports.searchVendors = async (req, res) => {
  try {
    // 쿼리 파라미터를 통해 값 가져오기
    const { name, userId, searchType } = req.query;
    // 로그 추가: 요청 파라미터 확인
    console.log('searchVendors endpoint called with:', {
      query,
      userId,
      searchType,
    });

    // userId가 존재하는지 확인
    if (!query || !userId || !searchType) {
      return res
        .status(400)
        .json({ message: 'Keyword, userId, and searchType are required' });
    }

    // 업체명 검색
    const vendors = await VendorService.searchVendors(
      query,
      userId,
      searchType
    );

    /* 검색 기록 저장
    console.log('Logging search history...'); // 로그 추가
    await SearchHistoryService.logSearch(userId, name, searchType);
*/
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error in searchVendors endpoint:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};
/* 
  async searchVendors(req, res) {
    try {
      const keyword = req.query.keyword; // 쿼리 파라미터로 검색어 가져오기
      const userId = req.user._id; // 인증된 사용자 ID 가져오기
      const searchType = req.query.searchType;
      if (!keyword || !userId) {
        return res
          .status(400)
          .json({ message: 'Name and userId are required' });
      }
      //검색 로직
      const vendors = await Vendor.find({
        name: new RegExp(keyword, 'i'),
        user: userId,
      });
      // 검색 기록 저장
      await SearchHistoryService.logSearch(userId, keyword, searchType);

      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
*/
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
  // 사용자 추천과 검색 기록을 처리하는 메서드
  // 검색 화면 로드 시 사용자 추천 장소와 최근 검색 기록 제공
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
  //검색 결과 저장
  async searchVendors(req, res) {
    const { keyword } = req.query;
    const userId = req.user._id;

    try {
      await VendorService.saveSearchHistory(userId, keyword, 'activity'); // 검색 기록 저장
      const vendors = await VendorService.searchActivitiesByKeyword(keyword);

      if (vendors.length === 0) {
        return res
          .status(404)
          .json({ message: 'No results found for your search' });
      }

      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ message: 'Search failed', error: error.message });
    }
  }
}

module.exports = new VendorController();
