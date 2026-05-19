import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    instructions: String,
    expectedOutput: String,
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requiredSkills: [String],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'advanced'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'submitted', 'under-review', 'approved', 'rejected', 'completed', 'overdue'], default: 'todo' },
    dueDate: { type: Date, required: true },
    githubLink: String,
    liveDemoLink: String,
    screenshot: String,
    submissionNote: String,
    workSummary: String,
    problemsFaced: String,
    timeTaken: String,
    submittedAt: Date,
    reviewStatus: String,
    reviewComment: String,
    rejectionReason: String,
    submissionRank: String,
    qualityScore: { type: Number, min: 0, max: 10 },
    performancePoints: { type: Number, default: 0 },
    versionHistory: [{
      versionNumber: Number,
      githubLink: String,
      liveDemoLink: String,
      screenshot: String,
      note: String,
      submittedAt: Date,
      status: String,
      reviewComment: String
    }]
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
