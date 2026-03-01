const requestService = require('../services/request.service');

class RequestController {
    async create(req, res, next) {
        try {
            const id = await requestService.createRequest(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Solicitud creada con éxito', data: { id } });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { estado, fecha_finalizacion_programada, fecha_finalizacion_real, justificacion_rechazo } = req.body;
            await requestService.updateRequestStatus(req.user.id, req.params.id, estado, {
                fecha_finalizacion_programada,
                fecha_finalizacion_real,
                justificacion_rechazo
            });
            res.status(200).json({ success: true, message: `Estado actualizado correctamente a ${estado}` });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const requests = await requestService.getRequests(req.user.id, req.user.nivel, page, limit);
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RequestController();
