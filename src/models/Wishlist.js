const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  marker: {
    color: {
      type: String,
      enum: ['red', 'yellow', 'green', 'blue', 'purple'],
      required: true,
    },
    categoryName: { type: String, required: true },
  },
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
