const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    location: { type: String, required: true },
    activityTag: { type: String, required: true },
    vendorTag: { type: String, required: true },
    date: { type: Date, required: true },
    weather: Object, // 날씨 데이터
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserActivity', UserActivitySchema);
