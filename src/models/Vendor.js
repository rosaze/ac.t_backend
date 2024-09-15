const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 업체명 or 장소명
  sigungu: { type: String, required: true }, // 시군구 이름
  contenttype: { type: String, required: true }, // 콘텐츠 타입 (관광지, 문화시설 등)

  category2: { type: String }, // 중분류
  category3: { type: String }, // 소분류
  createdtime: { type: Date, default: Date.now }, // 생성 시간
  firstimage: { type: String }, // 이미지 URL
  mapx: { type: Number }, // 지도 X좌표
  mapy: { type: Number }, // 지도 Y좌표
  modifiedtime: { type: Date }, // 수정 시간
});

module.exports = mongoose.model('Vendor', VendorSchema);
