import User from '../models/User.js';

export const checkAndAssignBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Simplistic example logic for badges
    if (user.performanceScore >= 100 && !user.badges.some(b => b.name === 'Consistent Performer')) {
      user.badges.push({ name: 'Consistent Performer', description: 'Reached 100 performance points', earnedAt: Date.now() });
      await user.save();
    }
  } catch (error) {
    console.error('Failed to assign badge', error);
  }
};
