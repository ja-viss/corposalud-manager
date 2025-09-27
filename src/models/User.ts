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
});

const User = models.User || model('User', UserSchema);

export default User;
