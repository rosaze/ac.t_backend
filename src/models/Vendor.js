const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  contentid: { type: String, required: true, unique: true },
  title: { type: String, required: true }, // 업체명 or 장소명
  addr1: { type: String, required: true }, // 기본 주소
  addr2: { type: String }, // 상세 주소
  areaname: { type: String, required: true }, // 도 이름 (강원도)
  sigunguname: { type: String, required: true }, // 시군구 이름
  category1: { type: String }, // 대분류 (레포츠, 관광지 등)
  category2: { type: String }, // 중분류
  category3: { type: String }, // 소분류
  contenttype: { type: String, required: true }, // 콘텐츠 타입 (관광지, 문화시설 등)
  createdtime: { type: Date, default: Date.now }, // 생성 시간
  firstimage: { type: String }, // 이미지 URL
  mapx: { type: Number }, // 지도 X좌표
  mapy: { type: Number }, // 지도 Y좌표
  mlevel: { type: Number }, // 지도 레벨
  modifiedtime: { type: Date }, // 수정 시간
  tel: { type: String }, // 전화번호
  zipcode: { type: String }, // 우편번호
});

module.exports = mongoose.model('Vendor', VendorSchema);
