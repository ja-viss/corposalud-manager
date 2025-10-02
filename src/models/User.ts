
import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Moderador', 'Obrero'], required: true },
  fechaCreacion: { type: Date, default: Date.now },
  creadoPor: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isSessionActive: { type: Boolean, default: false }, // Campo para controlar sesión activa
}, {
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
    },
  }
});

const User = models.User || model('User', UserSchema);

export default User;
