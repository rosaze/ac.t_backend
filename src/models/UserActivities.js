const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
      required: true,
    },
    location: { type: String, required: true },
    activityTag: { type: String, required: true },
    date: { type: Date, required: true },
    weather: Object, // 날씨 데이터
  },
  { timestamps: true },
  { collection: 'userActivities' }
); // 명시적으로 컬렉션 이름 설정

module.exports = mongoose.model('UserActivity', UserActivitySchema);
