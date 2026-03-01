const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const productDto = require('../dtos/product.dto');
const { validate } = require('../middlewares/validator.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireLevel } = require('../middlewares/role.middleware');

router.use(authenticate);

// Listar productos (cualquier nivel mayor a 1, o incluso el nivel 1 si quiere crear solicitudes basadas en estos)
router.get('/', requireLevel(1), productController.list);

// Nivel 3 o mayor requerido para administrar productos
router.post(
    '/',
    requireLevel(3),
    productDto.createProductDto,
    validate,
    productController.create
);

router.put(
    '/:id',
    requireLevel(3),
    productDto.updateProductDto,
    validate,
    productController.update
);

router.delete(
    '/:id',
    requireLevel(3),
    productController.remove
);

module.exports = router;
