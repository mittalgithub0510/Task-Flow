import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visibleTo: { type: String, enum: ['all', 'project_members'], default: 'all' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    expiresAt: Date
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
