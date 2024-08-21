//Product.js 모델 --> 상품 정보 관리
//CRUDconst Product = require('../models/Product');

const Product = require('../models/Product');

class ProductService {
  async createProduct(data) {
    const product = new Product(data);
    return await product.save();
  }

  async getProductById(productId) {
    return await Product.findById(productId).populate('seller').exec();
  }

  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    }).exec();
  }

  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId).exec();
  }

  async listProducts() {
    return await Product.find().populate('seller').exec();
  }
}

module.exports = new ProductService();
