const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const userDto = require('../dtos/user.dto');
const { validate } = require('../middlewares/validator.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireLevel } = require('../middlewares/role.middleware');

// Endpoint público
router.post('/login', userDto.loginDto, validate, userController.login);

// Endpoints protegidos para gestionar usuarios (Nivel 3 mínimo requerido salvo login)
router.use(authenticate);

router.post(
    '/',
    requireLevel(3),
    userDto.createUserDto,
    validate,
    userController.create
);

router.put(
    '/:id',
    requireLevel(3),
    userDto.updateUserDto,
    validate,
    userController.update
);

router.post(
    '/:id/reset-password',
    requireLevel(3),
    userDto.resetPasswordDto,
    validate,
    userController.resetPassword
);

router.delete(
    '/:id',
    requireLevel(3),
    userController.remove
);

router.get(
    '/',
    requireLevel(3),
    userController.list
);

module.exports = router;
