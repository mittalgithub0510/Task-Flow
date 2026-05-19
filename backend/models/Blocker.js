import mongoose from 'mongoose';

const blockerSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  screenshot: String,
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  adminReply: String,
  resolvedAt: Date
}, { timestamps: true });

export default mongoose.model('Blocker', blockerSchema);
