import mongoose, { Schema, models, model } from 'mongoose';

const CrewSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  moderadores: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  obreros: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  fechaCreacion: { type: Date, default: Date.now },
  creadoPor: { type: String, required: true },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  }
});

const Crew = models.Crew || model('Crew', CrewSchema);

export default Crew;
