import mongoose from 'mongoose';

const certificateSchema = mongoose.Schema({
  memberName: { type: String, required: true },
  projectName: { type: String, required: true },
  completedTasks: { type: Number, required: true },
  performanceScore: { type: Number, required: true },
  completionDate: { type: Date, default: Date.now },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificateId: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
