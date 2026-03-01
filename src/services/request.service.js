const requestRepository = require('../repositories/request.repository');
const auditService = require('./audit.service');
const productService = require('./product.service');

class RequestService {
    async createRequest(userId, data) {
        // Validation of product actively handled by controller, but we check logic here (e.g. if product_id exists and is active)
        if (data.producto_id) {
            const productRepo = require('../repositories/product.repository');
            const product = await productRepo.findById(data.producto_id);
            if (!product) throw { statusCode: 404, message: 'El producto no existe.' };
            if (product.estado !== 'activo') throw { statusCode: 400, message: 'El producto está inactivo.' };
        }

        data.usuario_creador = userId;
        const id = await requestRepository.create(data);

        await auditService.logAction({
            usuario_id: userId,
            accion: 'CREAR_SOLICITUD',
            entidad: 'solicitudes',
            entidad_id: id,
            descripcion: `Solicitud creada en estado CREADA con cantidad ${data.cantidad}.`
        });

        return id;
    }

    async updateRequestStatus(userId, reqId, newStatus, extraData = {}) {
        const request = await requestRepository.findById(reqId);
        if (!request) {
            throw { statusCode: 404, message: 'Solicitud no encontrada.' };
        }

        const currentStatus = request.estado;

        // Reglas de Transición
        const updates = {};
        let auditDesc = `Transición de ${currentStatus} a ${newStatus}.`;

        if (newStatus === 'APROBADA') {
            if (currentStatus !== 'CREADA') {
                throw { statusCode: 400, message: `No se puede aprobar una solicitud en estado ${currentStatus}.` };
            }
            if (!extraData.fecha_finalizacion_programada) {
                throw { statusCode: 400, message: 'REGLA CRÍTICA: Se requiere fecha_finalizacion_programada para aprobar.' };
            }
            updates.fecha_finalizacion_programada = extraData.fecha_finalizacion_programada;
            auditDesc += ` Fecha esperada: ${extraData.fecha_finalizacion_programada}.`;
        } 
        else if (newStatus === 'RECHAZADA') {
            if (['FINALIZADA', 'RECHAZADA'].includes(currentStatus)) {
                throw { statusCode: 400, message: `No se puede rechazar una solicitud que ya está ${currentStatus}.` };
            }
            if (!extraData.justificacion_rechazo) {
                throw { statusCode: 400, message: 'REGLA CRÍTICA: Se requiere justificacion_rechazo para rechazar.' };
            }
            updates.justificacion_rechazo = extraData.justificacion_rechazo;
            auditDesc += ` Motivo: ${extraData.justificacion_rechazo}.`;
        } 
        else if (newStatus === 'EN_PRODUCCION') {
            if (currentStatus !== 'APROBADA') {
                throw { statusCode: 400, message: 'Solo las solicitudes APROBADAS pueden pasar a EN_PRODUCCION.' };
            }
        } 
        else if (newStatus === 'FINALIZADA') {
            if (currentStatus !== 'EN_PRODUCCION') {
                throw { statusCode: 400, message: 'Solo las solicitudes EN_PRODUCCION pueden marcarse como FINALIZADA.' };
            }
            // Sistema NO finaliza automáticamente, se provee fecha real en este momento o se toma el actual
            updates.fecha_finalizacion_real = extraData.fecha_finalizacion_real || new Date().toISOString().split('T')[0];
        } else {
            throw { statusCode: 400, message: 'Estado destino inválido o no reconocido.' };
        }

        // REGLA CRÍTICA: Inmutabilidad de fecha_finalizacion_programada post-aprobación
        // Aseguramos de no sobrescribirla si ya existe y tratamos de modificarla (solo puede hacerlo en el flujo APROBADA inicial).
        // En nuestro flujo, solo es seteable en el estado de CREADA -> APROBADA
        if (extraData.fecha_finalizacion_programada && currentStatus !== 'CREADA' && newStatus !== 'APROBADA') {
            throw { statusCode: 400, message: 'REGLA CRÍTICA: La fecha de finalización programada no puede ser modificada tras la aprobación.' };
        }

        updates.estado = newStatus;

        await requestRepository.updateStatusAndFields(reqId, updates);

        await auditService.logAction({
            usuario_id: userId,
            accion: 'CAMBIO_ESTADO_SOLICITUD',
            entidad: 'solicitudes',
            entidad_id: reqId,
            descripcion: auditDesc
        });
    }

    async getRequests(userId, userNivel, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        // Nivel 1 solo ve las de él
        const filterId = userNivel === 1 ? userId : null;
        return await requestRepository.findAll(limit, offset, filterId);
    }
}

module.exports = new RequestService();
