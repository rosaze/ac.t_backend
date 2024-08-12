//Product.js 모델 --> 상품 정보 관리
//CRUDconst Product = require('../models/Product');

class ProductService {
  async getAllProducts() {
    return await Product.find().exec();
  }

  async getProductById(id) {
    return await Product.findById(id).exec();
  }

  async createProduct(data) {
    const product = new Product(data);
    return await product.save();
  }

  async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id).exec();
  }
}

module.exports = new ProductService();
