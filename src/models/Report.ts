/**
 * @file Report.ts
 * @description Define un esquema de Mongoose para la colección `reports`.
 *
 * **Nota:** Este esquema parece ser una versión anterior o un borrador y actualmente
 * no se utiliza en la lógica principal de la aplicación. La funcionalidad de reportes
 * se maneja a través del modelo `WorkReport`. Se mantiene por si se reutiliza en el futuro.
 *
 * Modela un reporte genérico que podría ser de tipo "Maestro" o "Actividad".
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Definición del esquema para reportes genéricos.
const ReportSchema = new Schema({
  // Nombre del reporte.
  nombre: { type: String, required: true },

  // Tipo de reporte.
  tipo: { type: String, enum: ['Maestro', 'Actividad'], required: true },

  // Username del usuario que generó el reporte.
  generadoPor: { type: String, required: true },

  // Fecha de creación del reporte.
  fechaCreacion: { type: Date, default: Date.now },

  // Rango de fechas que cubre el reporte.
  rangoFechas: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },

  // URL opcional donde se almacena el archivo PDF del reporte.
  url: { type: String },
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

// Crear o reutilizar el modelo `Report`.
const Report = models.Report || model('Report', ReportSchema);

export default Report;
