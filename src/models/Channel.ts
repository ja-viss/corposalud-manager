import mongoose, { Schema, models, model } from 'mongoose';

const ChannelSchema = new Schema({
  nombre: { type: String, required: true },
  type: { type: String, enum: ['GENERAL', 'CREW', 'ROLE', 'DIRECT', 'GROUP'], required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  crewId: { type: Schema.Types.ObjectId, ref: 'Crew', sparse: true },
  isDeletable: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now, index: true },
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

const Channel = models.Channel || model('Channel', ChannelSchema);

export default Channel;
