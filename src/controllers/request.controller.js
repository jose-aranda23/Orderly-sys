const requestService = require('../services/request.service');
const Excel = require('exceljs');

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

    async export(req, res, next) {
        try {
            const { usuario_id, fecha_inicio, fecha_fin, estado } = req.query;
            const filters = {};
            
            if (usuario_id) filters.usuario_id = parseInt(usuario_id);
            if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
            if (fecha_fin) filters.fecha_fin = fecha_fin;
            if (estado) filters.estado = estado;

            const requests = await requestService.getRequestsForExport(req.user.id, filters);

            const workbook = new Excel.Workbook();
            const sheet = workbook.addWorksheet('Solicitudes');

            sheet.columns = [
                { header: 'ID', key: 'id', width: 8 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Producto', key: 'producto_nombre', width: 25 },
                { header: 'Producto Personalizado', key: 'producto_personalizado', width: 25 },
                { header: 'Tipo Envase', key: 'tipo_envase', width: 15 },
                { header: 'Cantidad', key: 'cantidad', width: 12 },
                { header: 'Creador', key: 'creador_nombre', width: 20 },
                { header: 'Fecha Creación', key: 'fecha_creacion', width: 18 },
                { header: 'Fecha Finalización Programada', key: 'fecha_finalizacion_programada', width: 25 },
                { header: 'Fecha Finalización Real', key: 'fecha_finalizacion_real', width: 22 },
                { header: 'Nota', key: 'nota', width: 30 },
                { header: 'Justificación Rechazo', key: 'justificacion_rechazo', width: 30 }
            ];

            sheet.addRows(requests);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=informe_solicitudes.xlsx');

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { usuario_id, fecha_inicio, fecha_fin, estado } = req.query;
            const filters = {};
            
            if (usuario_id) filters.usuario_id = parseInt(usuario_id);
            if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
            if (fecha_fin) filters.fecha_fin = fecha_fin;
            if (estado) filters.estado = estado;

            const requests = await requestService.getAllRequests(filters);
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RequestController();
