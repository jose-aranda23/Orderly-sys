const { body } = require('express-validator');

const loginDto = [
    body('correo').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('contrasena').notEmpty().withMessage('La contraseña es obligatoria')
];

const createUserDto = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
    body('correo').isEmail().withMessage('Debe ser un correo electrónico válido').isLength({ max: 150 }),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nivel').isInt({ min: 1, max: 3 }).withMessage('El nivel debe ser 1, 2 o 3. El Nivel 4 es exclusivo de base de datos.')
];

const updateUserDto = [
    body('nombre').optional().isLength({ max: 100 }),
    body('estado').optional().isIn(['activo', 'inactivo']).withMessage('Estado inválido')
];

const resetPasswordDto = [
    body('nueva_contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

module.exports = {
    loginDto,
    createUserDto,
    updateUserDto,
    resetPasswordDto
};
