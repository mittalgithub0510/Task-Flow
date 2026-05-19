import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'completed', 'paused', 'closed'], default: 'active' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    deadline: { type: Date, required: true },
    progressPercentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
