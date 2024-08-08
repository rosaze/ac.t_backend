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
    hashtags: [{ type: String }],
    locationTag: { type: String },
    activityTag: { type: String },
    likes: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5, required: false }, // 별점 추가 (optional)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
