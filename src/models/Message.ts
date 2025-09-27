
import mongoose, { Schema, models, model } from 'mongoose';

const MessageSchema = new Schema({
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
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

const Message = models.Message || model('Message', MessageSchema);

export default Message;
