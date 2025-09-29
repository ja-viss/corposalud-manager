
import mongoose, { Schema, models, model } from 'mongoose';

const CrewSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String, required: false },
  moderadores: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  obreros: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  fechaCreacion: { type: Date, default: Date.now },
  creadoPor: { type: String, required: true },
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
      delete ret._id;
      delete ret.__v;
    },
  }
});

const Crew = models.Crew || model('Crew', CrewSchema);

export default Crew;
