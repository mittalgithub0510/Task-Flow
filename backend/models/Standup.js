import mongoose from 'mongoose';

const standupSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  yesterdayWork: { type: String, required: true },
  todayPlan: { type: String, required: true },
  blockers: String
}, { timestamps: true });

export default mongoose.model('Standup', standupSchema);
