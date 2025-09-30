

import mongoose, { Schema, models, model } from 'mongoose';

const ToolEntrySchema = new Schema({
  nombre: { type: String, required: true },
}, { _id: false });

const WorkReportSchema = new Schema({
  crewId: { type: Schema.Types.ObjectId, ref: 'Crew', required: true },
  municipio: { type: String, required: true },
  distancia: { type: Number, required: true },
  comentarios: { type: String, required: true },
  herramientasUtilizadas: [ToolEntrySchema],
  herramientasDanadas: [ToolEntrySchema],
  herramientasExtraviadas: [ToolEntrySchema],
  realizadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, default: Date.now },
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

const WorkReport = models.WorkReport || model('WorkReport', WorkReportSchema);

export default WorkReport;

    
