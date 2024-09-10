const ProductService = require('../services/ProductService');

class ProductController {
  async getProduct(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.productId);
      res.status(200).json(product);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching product', error: error.message });
    }
  }

  async listProducts(req, res) {
    try {
      const products = await ProductService.listProducts();
      res.status(200).json(products);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error listing products', error: error.message });
    }
  }

  // 관리자 전용 메소드들
  async createProduct(req, res) {
    try {
      console.log('사용자 객체:', req.user); // 디버깅을 위한 로그
      if (!req.user.isAdmin) {
        console.log('관리자 권한 확인 실패');
        return res.status(403).json({ message: 'Admin access required' });
      }
      const productData = {
        ...req.body,
        seller: req.user.id, // 명시적으로 seller 필드 설정
      };
      console.log('생성할 상품 데이터:', productData); // 디버깅을 위한 로그
      const product = await ProductService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('상품 생성 오류:', error);
      res
        .status(500)
        .json({ message: 'Error creating product', error: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      const product = await ProductService.updateProduct(
        req.params.productId,
        req.body
      );
      res.status(200).json(product);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating product', error: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      await ProductService.deleteProduct(req.params.productId);
      res.status(204).end();
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error deleting product', error: error.message });
    }
  }
}

module.exports = new ProductController();
