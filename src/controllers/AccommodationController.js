const VendorService = require('../services/VendorService');

class AccommodationController {
  // 특정 시군에 있는 숙박시설 정보 가져오기
  async getAccommodations(req, res) {
    try {
      const region = req.params.region; // URL 파라미터로 시군구명 가져오기
      const category = req.query.category || null; // 쿼리 파라미터로 숙박 유형 가져오기 (선택사항)
      const accommodations = await VendorService.getAccommodationsByRegion(
        region,
        category
      );
      res.status(200).json(accommodations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new AccommodationController();
