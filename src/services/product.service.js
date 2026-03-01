const productRepository = require('../repositories/product.repository');
const auditService = require('./audit.service');

class ProductService {
    async createProduct(userId, data) {
        const id = await productRepository.create(data);
        await auditService.logAction({
            usuario_id: userId,
            accion: 'CREAR_PRODUCTO',
            entidad: 'productos',
            entidad_id: id,
            descripcion: `Producto creado: ${data.nombre}`
        });
        return id;
    }

    async updateProduct(userId, id, data) {
        const product = await productRepository.findById(id);
        if (!product) throw { statusCode: 404, message: 'Producto no encontrado' };

        await productRepository.update(id, data);
        await auditService.logAction({
            usuario_id: userId,
            accion: 'ACTUALIZAR_PRODUCTO',
            entidad: 'productos',
            entidad_id: id,
            descripcion: `Actualización de producto. Campos cambiados: ${Object.keys(data).join(', ')}`
        });
    }

    async deleteProduct(userId, id) {
        const product = await productRepository.findById(id);
        if (!product) throw { statusCode: 404, message: 'Producto no encontrado' };

        // Una regla posible en ambientes reales es no borrar físicamente, 
        // pero la regla del requerimiento indicaba "Nivel 3 puede CRUD / Eliminar".
        // Lo mantendremos como físico o lógico dependiendo de las FK, pero la BD tiene DELETE SET NULL en solicitudes, así que no rompe la DB.
        await productRepository.delete(id);
        
        await auditService.logAction({
            usuario_id: userId,
            accion: 'ELIMINAR_PRODUCTO',
            entidad: 'productos',
            entidad_id: id,
            descripcion: `Producto eliminado: ${product.nombre}`
        });
    }

    async listProducts(page = 1, limit = 50, includeInactive = false) {
        const offset = (page - 1) * limit;
        return await productRepository.findAll(limit, offset, includeInactive);
    }
}

module.exports = new ProductService();
