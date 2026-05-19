import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { createNotification } from '../utils/createNotification.js';

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, projectId, visibleTo, priority, expiresAt } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      projectId,
      visibleTo,
      priority,
      expiresAt,
      createdBy: req.user._id,
    });
    
    if (visibleTo === 'all') {
      const allMembers = await User.find({ role: 'Member' });
      for (const member of allMembers) {
        await createNotification({
          title: 'New Announcement',
          message: `Admin ${req.user.name} posted: ${title}`,
          type: 'announcement_created',
          receiver: member._id,
          sender: req.user._id,
          priority: priority || 'medium'
        });
      }
    } else if (visibleTo === 'project_members' && projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        for (const memberId of project.members) {
          if (memberId.toString() !== req.user._id.toString()) {
            await createNotification({
              title: `Project Announcement: ${project.title}`,
              message: `Admin ${req.user.name} posted: ${title}`,
              type: 'announcement_created',
              receiver: memberId,
              sender: req.user._id,
              project: projectId,
              priority: priority || 'medium'
            });
          }
        }
      }
    }
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await Announcement.deleteOne({ _id: announcement._id });
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
