const WishlistService = require('../services/WishlistService');

class WishlistController {
  // 찜 목록 가져오기
  async getWishlist(req, res) {
    try {
      const userId = req.user._id; // 인증된 사용자 ID 가져오기
      const wishlist = await WishlistService.getWishlist(userId);
      res.status(200).json(wishlist);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 찜 목록에 추가하기
  async addToWishlist(req, res) {
    try {
      const userId = req.user.id; // 인증된 사용자 ID 가져오기
      const { vendorId } = req.body; // 요청 본문에서 vendorId 가져오기

      const newWishlistItem = await WishlistService.addToWishlist(
        userId,
        vendorId
      );
      res.status(201).json(newWishlistItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 찜 목록에서 제거하기
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id; // 인증된 사용자 ID 가져오기
      const { vendorId } = req.body; // 요청 본문에서 vendorId 가져오기

      const removedItem = await WishlistService.removeFromWishlist(
        userId,
        vendorId
      );
      res.status(200).json(removedItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new WishlistController();
