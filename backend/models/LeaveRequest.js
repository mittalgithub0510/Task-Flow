import mongoose from 'mongoose';

const leaveRequestSchema = mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // Optional, only for task_leave
    type: { type: String, enum: ['project_leave', 'task_leave'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['noted', 'reviewed'], default: 'noted' },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
