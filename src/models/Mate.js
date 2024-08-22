const mongoose = require('mongoose');
//메이트 모집 게시글 저장
const MateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hashtags: [{ type: String }], // 해시태그 추가
  locationTag: { type: String, required: true }, // location을 해시태그로 처리
  activityTag: { type: String, required: true }, // activity를 해시태그로 처리
  date: { type: Date, required: true }, //날짜저장
  maxParticipants: { type: Number, required: true },
  personal_preferences: {
    // 메이트 모집글 게시자의 선호도 반영
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 동적으로 personal_preferences 설정
MateSchema.pre('save', async function (next) {
  const user = await mongoose.model('User').findById(this.author).exec();
  this.personal_preferences = `${user.location_preference}_${user.environment_preference}_${user.group_preference}_${user.season_preference}`;
  next();
});

module.exports = mongoose.model('Mate', MateSchema);
