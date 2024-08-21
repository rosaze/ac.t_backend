//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가

const Vendor = require('../models/Vendor');

class VendorService {
  async searchVendors(query) {
    // 업체명 검색 (부분 일치)
    return await Vendor.find({ title: new RegExp(query, 'i') }).exec();
  } //vendor 컬렉션에서는 업체명이 title로 표시됨

  async addVendor(name) {
    // 새로운 업체명 추가
    const existingVendor = await Vendor.findOne({ title }).exec();
    if (!existingVendor) {
      const vendor = new Vendor({ name });
      return await vendor.save();
    }
    return existingVendor; // 이미 있는 경우 해당 업체명 반환
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
}

module.exports = new VendorService();
