const userService = require('../services/user.service');

class UserController {
    async login(req, res, next) {
        try {
            const { correo, contrasena } = req.body;
            const result = await userService.login(correo, contrasena);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const userId = await userService.createUser(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: { id: userId } });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await userService.updateUser(req.user.id, req.user.nivel, req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { nueva_contrasena } = req.body;
            await userService.resetPassword(req.user.id, req.user.nivel, req.params.id, nueva_contrasena);
            res.status(200).json({ success: true, message: 'Contraseña restablecida exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            await userService.deleteUser(req.user.id, req.user.nivel, req.params.id);
            res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            let users = await userService.listUsers(page, limit);
            
            // Regla de Negocio: Usuarios Nivel 3 no pueden ver Usuarios Nivel 4
            if (req.user.nivel === 3) {
                users = users.filter(u => u.nivel < 4);
            }
            
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    async getList(req, res, next) {
        try {
            const users = await userService.getAllForList();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    async activate(req, res, next) {
        try {
            await userService.activateUser(req.user.id, req.user.nivel, req.params.id);
            res.status(200).json({ success: true, message: 'Usuario activado correctamente.' });
        } catch (error) {
            next(error);
        }
    }

    async deactivate(req, res, next) {
        try {
            await userService.deactivateUser(req.user.id, req.user.nivel, req.params.id);
            res.status(200).json({ success: true, message: 'Usuario desactivado correctamente.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
