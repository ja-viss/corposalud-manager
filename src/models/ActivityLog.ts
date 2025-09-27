import mongoose, { Schema, models, model } from 'mongoose';

const ActivityLogSchema = new Schema({
  action: { type: String, required: true },
  realizadoPor: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  detalles: { type: String },
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

ActivityLogSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
