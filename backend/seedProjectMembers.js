import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allMembers = await User.find({ role: 'Member' }).select('_id name');
    const allProjects = await Project.find({}).select('_id title members');

    if (allMembers.length === 0) { console.error('❌ No members found.'); process.exit(1); }
    if (allProjects.length === 0) { console.error('❌ No projects found.'); process.exit(1); }

    console.log(`👥 Total Members: ${allMembers.length}`);
    console.log(`📁 Total Projects: ${allProjects.length}\n`);

    // Shuffle helper
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

    let totalJoined = 0;

    for (const project of allProjects) {
      // Each project gets 4–10 random members
      const count = Math.floor(Math.random() * 7) + 4;
      const shuffled = shuffle(allMembers);
      const toAdd = shuffled.slice(0, count);

      // Only add members not already in the project
      const existingIds = project.members.map(id => id.toString());
      const newMembers = toAdd.filter(m => !existingIds.includes(m._id.toString()));

      if (newMembers.length === 0) {
        console.log(`⏭️  ${project.title} — already has members, skipping`);
        continue;
      }

      await Project.findByIdAndUpdate(project._id, {
        $addToSet: { members: { $each: newMembers.map(m => m._id) } }
      });

      console.log(`✅ ${project.title} ← ${newMembers.length} members joined:`);
      newMembers.forEach(m => console.log(`     • ${m.name}`));
      totalJoined += newMembers.length;
    }

    console.log(`\n🎉 Done! ${totalJoined} member-project assignments created.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
