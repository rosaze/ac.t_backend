const VendorService = require('../services/VendorService');

class AccommodationController {
  // 특정 시군에 있는 숙박시설 정보 가져오기
  async getAccommodations(req, res) {
    try {
      const userId = req.user._id; // 유저아이디 필수
      const region = req.params.region; // URL 파라미터로 시군구명 가져오기
      const keyword = req.query.q;
      const category = req.query.category || null; // 쿼리 파라미터로 숙박 유형 가져오기 (선택사항)
      const searchType = 'accommodation';
      //숙박 시설 검색
      const accommodations = await VendorService.getAccommodationsByRegion(
        region,
        category
      );
      //검색 기록 저장
      await SearchHistoryService.logSearch(
        userId,
        keyword || region,
        searchType
      );
      res.status(200).json(accommodations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new AccommodationController();
