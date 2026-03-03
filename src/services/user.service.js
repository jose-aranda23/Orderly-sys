const userRepository = require('../repositories/user.repository');
const auditService = require('./audit.service');
const { hashPassword, comparePassword, generateToken } = require('../utils/crypto');

class UserService {
    async login(correo, contrasena) {
        const user = await userRepository.findByEmail(correo);

        if (!user) {
            throw { statusCode: 401, message: 'Credenciales inválidas.' };
        }

        if (user.estado !== 'activo') {
            throw { statusCode: 403, message: 'Cuenta inactiva.' };
        }

        if (user.bloqueado) {
            throw { statusCode: 403, message: 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.' };
        }

        const isMatch = await comparePassword(contrasena, user.contrasena);

        if (!isMatch) {
            const intentos = user.intentos_fallidos + 1;
            const bloqueado = intentos >= 5;
            await userRepository.updateLoginAttempts(user.id, intentos, bloqueado);

            if (bloqueado) {
                await auditService.logAction({
                    usuario_id: user.id,
                    accion: 'BLOQUEO_CUENTA',
                    entidad: 'usuarios',
                    entidad_id: user.id,
                    descripcion: `El usuario sobrepasó los 5 intentos fallidos y fue bloqueado automáticamente.`
                });
                throw { statusCode: 403, message: 'Cuenta bloqueada tras 5 intentos fallidos.' };
            }

            throw { statusCode: 401, message: `Credenciales inválidas. Intentos restantes: ${5 - intentos}` };
        }

        // Si es exitoso y tenía intentos, reiniciar
        if (user.intentos_fallidos > 0) {
            await userRepository.updateLoginAttempts(user.id, 0, false);
        }

        await auditService.logAction({
            usuario_id: user.id,
            accion: 'LOGIN',
            entidad: 'usuarios',
            entidad_id: user.id,
            descripcion: 'Inicio de sesión exitoso.'
        });

        const tokenPayload = {
            id: user.id,
            nivel: user.nivel,
            correo: user.correo
        };

        const token = generateToken(tokenPayload);

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                nivel: user.nivel
            }
        };
    }

    async createUser(creatorId, userData) {
        const existing = await userRepository.findByEmail(userData.correo);
        if (existing) {
            throw { statusCode: 400, message: 'El correo ya está registrado.' };
        }

        userData.contrasena = await hashPassword(userData.contrasena);
        const newUserId = await userRepository.create(userData);

        await auditService.logAction({
            usuario_id: creatorId,
            accion: 'CREAR_USUARIO',
            entidad: 'usuarios',
            entidad_id: newUserId,
            descripcion: `Se creó el usuario con correo ${userData.correo} y nivel ${userData.nivel}.`
        });

        return newUserId;
    }

    async updateUser(updaterId, updaterNivel, targetId, updateData) {
        const user = await userRepository.findById(targetId);
        if (!user) {
            throw { statusCode: 404, message: 'Usuario no encontrado.' };
        }
        
        if (updaterNivel === 3 && user.nivel === 4) {
            throw { statusCode: 403, message: 'Privilegios insuficientes para modificar a un Administrador Nivel 4.' };
        }

        await userRepository.update(targetId, updateData);

        await auditService.logAction({
            usuario_id: updaterId,
            accion: 'ACTUALIZAR_USUARIO',
            entidad: 'usuarios',
            entidad_id: targetId,
            descripcion: `Actualización de datos del usuario. Campos cambiados: ${Object.keys(updateData).join(', ')}`
        });
    }

    async resetPassword(updaterId, updaterNivel, targetId, nuevaContrasena) {
        const targetUser = await userRepository.findById(targetId);
        if (!targetUser) {
            throw { statusCode: 404, message: 'Usuario no encontrado.' };
        }

        // Reglas de negocio sobre recuperación
        if (updaterNivel === 3 && targetUser.nivel >= 3) {
            throw { statusCode: 403, message: 'Un usuario Nivel 3 no puede cambiar la contraseña de otro Nivel 3 o 4.' };
        }

        const hashed = await hashPassword(nuevaContrasena);
        await userRepository.update(targetId, {
            contrasena: hashed,
            intentos_fallidos: 0,
            bloqueado: false
        });

        await auditService.logAction({
            usuario_id: updaterId,
            accion: 'CAMBIO_CONTRASENA',
            entidad: 'usuarios',
            entidad_id: targetId,
            descripcion: `Se restableció la contraseña y se desbloqueó la cuenta (si correspondía).`
        });
    }

    async deleteUser(deleterId, deleterNivel, targetId) {
        const targetUser = await userRepository.findById(targetId);
        if (!targetUser) {
            throw { statusCode: 404, message: 'Usuario no encontrado.' };
        }

        if (deleterNivel === 3 && targetUser.nivel === 4) {
            throw { statusCode: 403, message: 'Privilegios insuficientes para eliminar a un Administrador Nivel 4.' };
        }

        // Prevención de borrarte a ti mismo si eres nivel 4, etc. (Opcional, pero buena práctica)
        if (deleterId === parseInt(targetId)) {
            throw { statusCode: 400, message: 'No puedes eliminarte a ti mismo.' };
        }

        await userRepository.delete(targetId);

        await auditService.logAction({
            usuario_id: deleterId,
            accion: 'ELIMINAR_USUARIO',
            entidad: 'usuarios',
            entidad_id: targetId,
            descripcion: `Se eliminó al usuario con correo ${targetUser.correo}.`
        });
    }

    async listUsers(page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await userRepository.findAll(limit, offset);
    }

    async getAllForList() {
        return await userRepository.findAllForList();
    }

    async activateUser(actorId, actorNivel, targetId) {
        const targetUser = await userRepository.findById(targetId);
        if (!targetUser) {
            throw { statusCode: 404, message: 'Usuario no encontrado.' };
        }

        if (actorNivel === 3 && targetUser.nivel === 4) {
            throw { statusCode: 403, message: 'Privilegios insuficientes para activar a un Administrador Nivel 4.' };
        }

        await userRepository.update(targetId, { estado: 'activo' });

        await auditService.logAction({
            usuario_id: actorId,
            accion: 'ACTIVAR_USUARIO',
            entidad: 'usuarios',
            entidad_id: targetId,
            descripcion: `Se activó el usuario ${targetUser.nombre}.`
        });
    }

    async deactivateUser(actorId, actorNivel, targetId) {
        const targetUser = await userRepository.findById(targetId);
        if (!targetUser) {
            throw { statusCode: 404, message: 'Usuario no encontrado.' };
        }

        if (actorNivel === 3 && targetUser.nivel === 4) {
            throw { statusCode: 403, message: 'Privilegios insuficientes para desactivar a un Administrador Nivel 4.' };
        }

        if (actorId === parseInt(targetId)) {
            throw { statusCode: 400, message: 'No puedes desactivarte a ti mismo.' };
        }

        await userRepository.update(targetId, { estado: 'inactivo' });

        await auditService.logAction({
            usuario_id: actorId,
            accion: 'DESACTIVAR_USUARIO',
            entidad: 'usuarios',
            entidad_id: targetId,
            descripcion: `Se desactivó el usuario ${targetUser.nombre}.`
        });
    }
}

module.exports = new UserService();
