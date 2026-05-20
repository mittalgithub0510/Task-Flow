import User from '../models/User.js';
import { createNotification } from '../utils/createNotification.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      if (req.body.performanceScore !== undefined) {
        const oldScore = user.performanceScore;
        const newScore = req.body.performanceScore;
        const diff = newScore - oldScore;
        user.performanceScore = newScore;

        // Notify the member about the points change
        if (diff !== 0 && req.user && req.user._id.toString() !== user._id.toString()) {
          const isAdd = diff > 0;
          await createNotification({
            title: isAdd ? `🏆 Points Added — +${diff} pts` : `⚠️ Points Deducted — ${diff} pts`,
            message: isAdd
              ? `Your performance score has been increased by ${diff} point${diff !== 1 ? 's' : ''}. New total: ${newScore} pts. Keep up the great work!`
              : `Your performance score has been reduced by ${Math.abs(diff)} point${Math.abs(diff) !== 1 ? 's' : ''}. New total: ${newScore} pts.`,
            type: 'points_update',
            receiver: user._id,
            sender: req.user._id,
            oldValue: `${oldScore} pts`,
            newValue: `${newScore} pts`,
            actionDetails: `Performance score updated by Admin`,
            priority: isAdd ? 'medium' : 'high',
          });
        }
      }

      if (req.body.badges) {
        user.badges = req.body.badges;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        performanceScore: updatedUser.performanceScore,
        badges: updatedUser.badges
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
