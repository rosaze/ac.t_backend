//장바구니 관련 비지니스 로직const Cart = require('../models/Cart');
const Cart = require('../models/cart');
const Product = require('../models/Product');
const Rental = require('../models/Rental');

class CartService {
  async getCart(userId) {
    return await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.rental')
      .exec();
  }

  async addItemToCart(userId, rentalId, quantity, rentalPeriod) {
    const cart = await Cart.findOne({ user: userId });
    const rentalItem = await Rental.findById(rentalId).exec();

    if (!rentalItem) {
      throw new Error('Rental item not found');
    }

    const totalDays = this.calculateRentalDays(rentalPeriod);
    const totalPrice = rentalItem.dailyRentalPrice * totalDays * quantity;

    if (!cart) {
      const newCart = new Cart({
        user: userId,
        items: [{ rental: rentalItem._id, quantity, rentalPeriod, totalPrice }],
      });
      return await newCart.save();
    } else {
      const existingItem = cart.items.find(
        (item) => item.rental.toString() === rentalId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.rentalPeriod = rentalPeriod;
        existingItem.totalPrice =
          rentalItem.dailyRentalPrice *
          this.calculateRentalDays(existingItem.rentalPeriod) *
          existingItem.quantity;
      } else {
        cart.items.push({
          rental: rentalItem._id,
          quantity,
          rentalPeriod,
          totalPrice,
        });
      }
      return await cart.save();
    }
  }

  async updateCartItem(userId, rentalId, quantity, rentalPeriod) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      const item = cart.items.find(
        (item) => item.rental.toString() === rentalId
      );
      if (item) {
        const totalDays = this.calculateRentalDays(rentalPeriod);
        const rentalItem = await Rental.findById(rentalId).exec();
        item.quantity = quantity;
        item.rentalPeriod = rentalPeriod;
        item.totalPrice = rentalItem.dailyRentalPrice * totalDays * quantity;
        return await cart.save();
      }
    }
    throw new Error('Item not found in cart');
  }

  async removeItemFromCart(userId, rentalId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.rental.toString() !== rentalId
      );
      return await cart.save();
    }
    throw new Error('Item not found in cart');
  }

  // 렌탈 기간 계산 메서드 추가
  calculateRentalDays(rentalPeriod) {
    const [startDate, endDate] = rentalPeriod
      .split(' to ')
      .map((date) => new Date(date));
    const timeDifference = Math.abs(endDate - startDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }
}

module.exports = new CartService();
