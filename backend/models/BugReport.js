import mongoose from 'mongoose';

const bugReportSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'fixed', 'verified'], default: 'open' },
  screenshot: String
}, { timestamps: true });

export default mongoose.model('BugReport', bugReportSchema);
