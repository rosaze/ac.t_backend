const Wishlist = require('../models/Wishlist');
const User = require('../models/User');

class WishlistService {
  // 사용자의 찜 목록 가져오기
  async getWishlist(userId) {
    try {
      const wishlist = await Wishlist.find({ user: userId })
        .populate('vendor') // Vendor와 연결된 정보를 함께 가져오기
        .exec();
      return wishlist;
    } catch (error) {
      throw new Error('Failed to retrieve wishlist');
    }
  }

  // 찜 목록에 추가하기
  async addToWishlist(userId, vendorId) {
    try {
      // 이미 찜 목록에 있는지 확인
      const existingItem = await Wishlist.findOne({
        user: userId,
        vendor: vendorId,
      });
      if (existingItem) {
        throw new Error('This item is already in your wishlist.');
      }

      const newWishlistItem = new Wishlist({ user: userId, vendor: vendorId });
      await newWishlistItem.save();
      return newWishlistItem;
    } catch (error) {
      throw new Error(error.message || 'Failed to add item to wishlist');
    }
  }

  // 찜 목록에서 제거하기
  async removeFromWishlist(userId, vendorId) {
    try {
      const result = await Wishlist.findOneAndDelete({
        user: userId,
        vendor: vendorId,
      });
      if (!result) {
        throw new Error('Item not found in wishlist.');
      }
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove item from wishlist');
    }
  }
}

module.exports = new WishlistService();
