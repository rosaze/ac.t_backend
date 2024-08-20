//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가

const Vendor = require('../models/Vendor');

class VendorService {
  async searchVendors(query) {
    // 업체명 검색 (부분 일치)
    return await Vendor.find({ name: new RegExp(query, 'i') }).exec();
  }

  async addVendor(name) {
    // 새로운 업체명 추가
    const existingVendor = await Vendor.findOne({ name }).exec();
    if (!existingVendor) {
      const vendor = new Vendor({ name });
      return await vendor.save();
    }
    return existingVendor; // 이미 있는 경우 해당 업체명 반환
  }
}

module.exports = new VendorService();
