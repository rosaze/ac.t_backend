//사용자가 해시태그 입력시 해당 입력에 따라 자동으로 업체명 검색, 새롭게 추가
const VendorService = require('../services/VendorService');

class VendorController {
  async searchVendors(req, res) {
    try {
      const query = req.query.q;
      const vendors = await VendorService.searchVendors(query);
      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async addVendor(req, res) {
    try {
      const name = req.body.name;
      const vendor = await VendorService.addVendor(name);
      res.status(201).json(vendor);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new VendorController();
