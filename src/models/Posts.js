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
      enum: ['review', 'general'], // "review" or "general"
      required: true,
    },
    hashtags: [{ type: String }],
    locationTag: { type: String, required: true },
    activityTag: { type: String, required: true },
    vendorTag: { type: String, required: true },
    //해시태그 필수필드로 만듬
    likes: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5, required: false }, // 별점 추가 (optional)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Posts', PostSchema);
