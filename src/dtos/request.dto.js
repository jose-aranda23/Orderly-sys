const { body } = require('express-validator');

const createRequestDto = [
    body('producto_id').optional({ nullable: true }).isInt(),
    body('producto_personalizado').optional({ nullable: true }).isString().isLength({ max: 150 }),
    body().custom((value, { req }) => {
        if (!req.body.producto_id && !req.body.producto_personalizado) {
            throw new Error('Debe especificar un producto del catálogo o un producto personalizado.');
        }
        return true;
    }),
    body('tipo_envase').notEmpty().withMessage('El tipo de envase es obligatorio.').isLength({ max: 100 }),
    body('cantidad').isInt({ gt: 0 }).withMessage('La cantidad debe ser mayor a cero.'),
    body('nota').optional().isString()
];

const updateStatusDto = [
    body('estado').isIn(['APROBADA', 'EN_PRODUCCION', 'FINALIZADA', 'RECHAZADA']).withMessage('Estado de destino inválido.'),
    
    // Reglas de negocio críticas (estas serán además doble verificadas en capa de servicio pero es bueno atajarlas pronto):
    body('fecha_finalizacion_programada').if(body('estado').equals('APROBADA')).notEmpty().withMessage('Es obligatorio proveer una fecha_finalizacion_programada para aprobar una solicitud.').isISO8601(),
    
    body('justificacion_rechazo').if(body('estado').equals('RECHAZADA')).notEmpty().withMessage('La justificación_rechazo es estrictamente obligatoria al rechazar una solicitud.')
];

module.exports = {
    createRequestDto,
    updateStatusDto
};
