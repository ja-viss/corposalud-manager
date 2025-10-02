/**
 * @file Crew.ts
 * @description Define el esquema de Mongoose para la colección `crews`.
 *
 * Este esquema modela las cuadrillas de trabajo, que consisten en un grupo de obreros
 * supervisados por uno o más moderadores. También almacena metadatos como el nombre,
 * la descripción y quién la creó.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para las cuadrillas.
const CrewSchema = new Schema({
  // Nombre único de la cuadrilla, generado automáticamente (ej. "Cuadrilla - N°1").
  nombre: { type: String, required: true, unique: true },

  // Descripción opcional de la actividad o propósito de la cuadrilla.
  descripcion: { type: String, required: false },

  // Array de IDs de usuarios con rol 'Moderador' que supervisan la cuadrilla.
  moderadores: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Array de IDs de usuarios con rol 'Obrero' que forman parte de la cuadrilla.
  obreros: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Fecha de creación de la cuadrilla.
  fechaCreacion: { type: Date, default: Date.now },

  // Username del usuario que creó la cuadrilla.
  creadoPor: { type: String, required: true },
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

// Crear o reutilizar el modelo `Crew`.
const Crew = models.Crew || model('Crew', CrewSchema);

export default Crew;
