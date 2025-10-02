/**
 * @file WorkReport.ts
 * @description Define el esquema de Mongoose para la colección `workreports`.
 *
 * Este esquema modela los reportes de trabajo que las cuadrillas realizan.
 * Contiene detalles de la actividad, como ubicación, distancia, y un inventario
 * de las herramientas utilizadas, dañadas y extraviadas.
 */

import mongoose, { Schema, models, model } from 'mongoose';

// Sub-esquema para las entradas de herramientas.
// No se le crea un _id propio para que sea un subdocumento dentro del reporte.
const ToolEntrySchema = new Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, default: 0 },
}, { _id: false });

// Definición del esquema principal para los reportes de trabajo.
const WorkReportSchema = new Schema({
  // Referencia a la cuadrilla que realizó el trabajo.
  crewId: { type: Schema.Types.ObjectId, ref: 'Crew', required: true },
  
  // Detalles de la actividad.
  municipio: { type: String, required: true },
  distancia: { type: Number, required: true },
  comentarios: { type: String, required: false },
  
  // Inventario de herramientas.
  herramientasUtilizadas: [ToolEntrySchema],
  herramientasDanadas: [ToolEntrySchema],
  herramientasExtraviadas: [ToolEntrySchema],
  
  // Metadatos del reporte.
  realizadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Quién creó el reporte.
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

// Crear o reutilizar el modelo `WorkReport`.
const WorkReport = models.WorkReport || model('WorkReport', WorkReportSchema);

export default WorkReport;
