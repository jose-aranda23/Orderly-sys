const { body } = require('express-validator');

const createProductDto = [
    body('nombre').notEmpty().withMessage('El nombre del producto es obligatorio').isLength({ max: 150 }),
    body('descripcion').optional().isString()
];

const updateProductDto = [
    body('nombre').optional().notEmpty().isLength({ max: 150 }),
    body('descripcion').optional().isString(),
    body('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado inválido')
];

module.exports = {
    createProductDto,
    updateProductDto
};
