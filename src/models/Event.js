const mongoose = require('mongoose');
//이벤트 정보, 사용자 참여 및 투표 관련 데이터 저장
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // 이벤트 이미지 URL
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      imageUrl: { type: String }, // 사용자가 업로드한 이미지 URL
      likes: { type: Number, default: 0 }, // 좋아요 수 필드 추가
    },
  ],
  createdAt: { type: Date, default: Date.now },
  endsAt: { type: Date, required: true }, // 이벤트 종료 날짜
});

module.exports = mongoose.model('Event', EventSchema);
