const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
