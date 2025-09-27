import mongoose, { Schema, models, model } from 'mongoose';

const ActivityLogSchema = new Schema({
  action: { type: String, required: true },
  realizadoPor: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  detalles: { type: String },
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

const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
