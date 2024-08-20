//일단 이름은 지피티한테 추천받아서 vendor (업체)로 지정했는데 바꿀수도 ㅋㅋ
//데이터베이스에 일단 vendor 이라는 컬렉션 추가ㅐ서 업체명들이랑 데이터 저장할건데, 뭔가 activity에 들어가야할것같긴함.
//근데 이미 activity 에 선호도 정보가 들어가 있어서....

//등록된 업체 데이터 관리, 향후 해시태그 자동 완성 기능에 사용
const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // 카테고리 추가
  location: {
    //위치 정보 ( 필터링 위해)
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  description: { type: String, required: false }, // 짧은 소개글
  tags: [{ type: String }], //태그 ( 선호도 반영해서 나중에 수정 )
  imageUrl: { type: String, required: false }, // 로고나 이미지
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vendor', VendorSchema);
