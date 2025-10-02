/**
 * @file Message.ts
 * @description Define el esquema de Mongoose para la colección `messages`.
 *
 * Este esquema modela cada mensaje individual enviado en los canales de chat,
 * vinculando el contenido del mensaje con el canal al que pertenece y el usuario
 * que lo envió.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para los mensajes.
const MessageSchema = new Schema({
  // ID del canal al que pertenece el mensaje.
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },

  // ID del usuario que envió el mensaje.
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Contenido de texto del mensaje.
  content: { type: String, required: true },

  // Fecha y hora en que se envió el mensaje.
  fecha: { type: Date, default: Date.now },
}, {
  // Opciones de serialización.
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id; // Renombrar `_id` a `id`.
      delete ret._id;
      delete ret.__v;
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

// Crear o reutilizar el modelo `Message`.
const Message = models.Message || model('Message', MessageSchema);

export default Message;
