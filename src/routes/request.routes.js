const express = require('express');
const router = express.Router();

const requestController = require('../controllers/request.controller');
const requestDto = require('../dtos/request.dto');
const { validate } = require('../middlewares/validator.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireLevel } = require('../middlewares/role.middleware');

router.use(authenticate);

// Nivel 1 ve solo las propias, Nivel 2+ ve todas (lógica tratada en service)
router.get('/', requestController.list);

// Crear (Nivel 1 en adelante)
router.post(
    '/',
    requireLevel(1),
    requestDto.createRequestDto,
    validate,
    requestController.create
);

// Cambiar estado (Nivel 2 en adelante)
router.patch(
    '/:id/estado',
    requireLevel(2),
    requestDto.updateStatusDto,
    validate,
    requestController.updateStatus
);

module.exports = router;
