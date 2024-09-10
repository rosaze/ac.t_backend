const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['review', 'general'], // 리뷰, 일반
      required: true,
    },
    hashtags: [{ type: String }],
    locationTag: { type: String, required: true },
    activityTag: { type: String, required: true },
    vendorTag: { type: String, required: true },
    date: { type: Date, required: true },
    //weather: Object, // 날씨 데이터를 저장할 필드
  },
  { timestamps: true }
);

module.exports = mongoose.model('Posts', PostSchema);
