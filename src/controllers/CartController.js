//구매자 장바구니 관리 (rental + product 한번에)
const CartService = require('../services/CartService');

class CartController {
  async getCart(req, res) {
    try {
      const cart = await CartService.getCart(req.user._id);
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching cart', error: error.message });
    }
  }

  async addItemToCart(req, res) {
    try {
      const { productId, quantity, rentalPeriod } = req.body; // 렌탈 기간 추가
      const cart = await CartService.addItemToCart(
        req.user._id,
        productId,
        quantity,
        rentalPeriod
      );
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error adding item to cart', error: error.message });
    }
  }

  async updateCartItem(req, res) {
    try {
      const { productId, quantity, rentalPeriod } = req.body; // 렌탈 기간 추가
      const cart = await CartService.updateCartItem(
        req.user._id,
        productId,
        quantity,
        rentalPeriod
      );
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating cart item', error: error.message });
    }
  }

  async removeItemFromCart(req, res) {
    try {
      const { productId } = req.params;
      const cart = await CartService.removeItemFromCart(
        req.user._id,
        productId
      );
      res.status(200).json(cart);
    } catch (error) {
      res
        .status(500)
        .json({
          message: 'Error removing item from cart',
          error: error.message,
        });
    }
  }
}

module.exports = new CartController();
