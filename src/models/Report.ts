import mongoose, { Schema, models, model } from 'mongoose';

const ReportSchema = new Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ['Maestro', 'Actividad'], required: true },
  generadoPor: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  rangoFechas: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  url: { type: String }, // URL al archivo del reporte generado
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

const Report = models.Report || model('Report', ReportSchema);

export default Report;
