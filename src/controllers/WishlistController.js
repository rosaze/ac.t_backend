const WishlistService = require('../services/WishlistService');
//라우트는 vendorRoutes.js 에 추가
class WishlistController {
  // 찜 목록 가져오기...?---> 수정
  async getWishlist(req, res) {
    const userId = req.user._id;

    try {
      const wishlist = await WishlistService.getWishlist(userId);
      res.status(200).json(wishlist);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to retrieve wishlist', error: error.message });
    }
  }

  // 찜 목록에 추가하기
  async addToWishlist(req, res) {
    const userId = req.user._id;
    const { vendorId } = req.body;

    try {
      const newWishlistItem = await WishlistService.addToWishlist(
        userId,
        vendorId
      );
      res.status(201).json(newWishlistItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 찜 목록에서 제거하기 (선택 사항)
  async removeFromWishlist(req, res) {
    const userId = req.user._id;
    const { vendorId } = req.body;

    try {
      const removedItem = await WishlistService.removeFromWishlist(
        userId,
        vendorId
      );
      res.status(200).json(removedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 기타 기존 메서드들...
}

module.exports = new WishlistController();
