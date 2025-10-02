/**
 * @file User.ts
 * @description Define el esquema de Mongoose para la colección `users`.
 *
 * Este esquema es fundamental para la aplicación, ya que modela a los usuarios
 * con todos sus datos personales, credenciales de acceso, rol y estado.
 * Es la pieza central para la autenticación y la gestión de permisos.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para los usuarios.
const UserSchema = new Schema({
  // Datos personales.
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true }, // Único para evitar duplicados.
  email: { type: String, required: true, unique: true }, // Único para inicio de sesión y notificaciones.
  telefono: { type: String, required: true },

  // Credenciales y rol.
  username: { type: String, required: true, unique: true }, // Usado para login de Personal.
  contrasena: { type: String, required: true }, // Almacenada como hash.
  role: { type: String, enum: ['Admin', 'Moderador', 'Obrero'], required: true },

  // Metadatos.
  fechaCreacion: { type: Date, default: Date.now },
  creadoPor: { type: String, required: true }, // Username de quien creó el usuario.
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  // Control de sesión.
  isSessionActive: { type: Boolean, default: false }, // Flag para controlar sesiones activas.
}, {
  // Opciones de serialización.
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id; // Renombrar `_id` a `id`.
      delete ret._id;
      delete ret.__v; // Eliminar el campo de versión.
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

// Crear o reutilizar el modelo `User`.
const User = models.User || model('User', UserSchema);

export default User;
