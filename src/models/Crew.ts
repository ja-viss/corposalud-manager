import mongoose, { Schema, models, model } from 'mongoose';

const CrewSchema = new Schema({
  nombre: { type: String, required: true, unique: true },
  moderadores: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  obreros: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  fechaCreacion: { type: Date, default: Date.now },
  creadoPor: { type: String, required: true },
}, {
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  }
});

CrewSchema.virtual('id').get(function() {
  return this._id.toHexString();
});


const Crew = models.Crew || model('Crew', CrewSchema);

export default Crew;
