/**
 * @file Channel.ts
 * @description Define el esquema de Mongoose para la colección `channels`.
 *
 * Este esquema modela los canales de chat del sistema, que pueden ser de diferentes tipos
 * (generales, de rol, de cuadrilla, directos o grupales), y almacena la lista de
 * miembros que pertenecen a cada uno.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para los canales de chat.
const ChannelSchema = new Schema({
  // Nombre del canal. Ej: "Anuncios Generales", "Cuadrilla - N°1", "Mi Grupo".
  nombre: { type: String, required: true },

  // Tipo de canal. Define su propósito y comportamiento.
  type: { type: String, enum: ['GENERAL', 'CREW', 'ROLE', 'DIRECT', 'GROUP'], required: true },

  // Array de IDs de usuarios que son miembros de este canal.
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Si el canal es de tipo 'CREW', aquí se almacena el ID de la cuadrilla asociada.
  crewId: { type: Schema.Types.ObjectId, ref: 'Crew', sparse: true }, // `sparse` permite valores nulos sin violar la unicidad.

  // Flag que indica si el canal puede ser eliminado por un usuario.
  isDeletable: { type: Boolean, default: true },

  // Fecha de creación del canal.
  fechaCreacion: { type: Date, default: Date.now },

  // Timestamp del último mensaje enviado. Se usa para ordenar la lista de canales.
  lastMessageAt: { type: Date, default: Date.now, index: true },
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

// Crear o reutilizar el modelo `Channel`.
const Channel = models.Channel || model('Channel', ChannelSchema);

export default Channel;
