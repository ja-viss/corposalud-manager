/**
 * @file activity-log.ts
 * @description Provee una función de utilidad para registrar actividades importantes en la base de datos.
 *
 * Este módulo abstrae la lógica de creación de registros de bitácora (ActivityLog),
 * permitiendo que otras partes de la aplicación (como las Server Actions) puedan registrar
 * eventos de manera consistente y segura.
 */

import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';

/**
 * Registra una nueva acción en la bitácora del sistema.
 * Esta función se conecta a la base de datos y crea un nuevo documento en la colección 'activitylogs'.
 * Está diseñada para fallar silenciosamente (solo imprime un error en consola) para no interrumpir
 * la acción principal del usuario si el registro en la bitácora falla.
 *
 * @param {string} action - Una cadena que describe la acción realizada (ej. 'user-creation:john.doe').
 * @param {string} realizadoPor - El nombre de usuario de quien realizó la acción.
 * @param {string} [detalles] - Detalles adicionales opcionales sobre la acción.
 * @returns {Promise<void>} No devuelve ningún valor.
 */
export async function logActivity(action: string, realizadoPor: string, detalles?: string) {
    try {
        await dbConnect();
        const newLog = new ActivityLog({
            action,
            realizadoPor,
            detalles,
            fecha: new Date(),
        });
        await newLog.save();
    } catch (error) {
        console.error('Error al registrar la actividad:', error);
        // Falla silenciosamente para no interrumpir la acción principal del usuario.
    }
}
