/**
 * @file ActivityLog.ts
 * @description Define el esquema de Mongoose para la colección `activitylogs`.
 *
 * Este esquema modela los registros de la bitácora del sistema, guardando información
 * sobre las acciones importantes que ocurren en la aplicación, quién las realizó y cuándo.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para los registros de actividad.
const ActivityLogSchema = new Schema({
  // Acción registrada. Ej: 'user-creation', 'crew-deletion:Cuadrilla-N°5'.
  action: { type: String, required: true },
  
  // Nombre de usuario de la persona que realizó la acción.
  realizadoPor: { type: String, required: true },
  
  // Fecha y hora en que se registró la acción.
  fecha: { type: Date, default: Date.now },
  
  // Detalles adicionales opcionales sobre el evento.
  detalles: { type: String },
}, {
  // Opciones de serialización para transformar el documento de Mongoose.
  toJSON: {
    virtuals: true, // Incluir campos virtuales (`id`).
    transform(doc, ret) {
      ret.id = ret._id; // Renombrar `_id` a `id` para consistencia en el frontend.
      delete ret._id;
      delete ret.__v; // Eliminar el campo de versión de Mongoose.
    },
  },
  toObject: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  }
});

// Crear el modelo `ActivityLog` si no existe, o reutilizarlo si ya fue compilado.
// Esto evita errores durante el hot-reloading en desarrollo.
const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
