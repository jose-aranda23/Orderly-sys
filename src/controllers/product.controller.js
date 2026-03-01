const productService = require('../services/product.service');

class ProductController {
    async create(req, res, next) {
        try {
            const id = await productService.createProduct(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Producto creado', data: { id } });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await productService.updateProduct(req.user.id, req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Producto actualizado' });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            await productService.deleteProduct(req.user.id, req.params.id);
            res.status(200).json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            // Solo Nivel 3 o 4 podría ver inactivos (lógica de negocio simple)
            const includeInactive = req.user.nivel >= 3;
            const products = await productService.listProducts(page, limit, includeInactive);
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
