const ProductService = require('../services/ProductService');

class ProductController {
  async createProduct(req, res) {
    try {
      if (!req.user.isDeveloper && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: 'Only developers can create products' });
      }

      const productData = { ...req.body, seller: req.user.id };
      const product = await ProductService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error creating product', error: error.message });
    }
  }

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

  async updateProduct(req, res) {
    try {
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
      await ProductService.deleteProduct(req.params.productId);
      res.status(204).end();
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error deleting product', error: error.message });
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
}

module.exports = new ProductController();
