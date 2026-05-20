import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import User from './models/User.js';

dotenv.config();

const projects = [
  {
    title: 'EduSync Platform',
    description: 'A unified learning management system for universities to manage courses, assignments, attendance, and grades. Supports real-time collaboration between students and instructors.',
    category: 'EdTech',
    status: 'active',
    priority: 'high',
    deadline: new Date('2026-09-30'),
    progressPercentage: 28,
  },
  {
    title: 'MediTrack Pro',
    description: 'A healthcare records management system allowing hospitals to digitize patient records, schedule appointments, and track medical history securely across departments.',
    category: 'Healthcare',
    status: 'active',
    priority: 'high',
    deadline: new Date('2026-08-15'),
    progressPercentage: 45,
  },
  {
    title: 'RetailPulse Analytics',
    description: 'A retail business intelligence dashboard that provides real-time sales analytics, inventory forecasting, and customer behaviour insights for multi-store chains.',
    category: 'Analytics',
    status: 'active',
    priority: 'medium',
    deadline: new Date('2026-07-20'),
    progressPercentage: 60,
  },
  {
    title: 'FinVault Banking App',
    description: 'A secure mobile banking application with features including fund transfers, bill payments, fixed deposits, loan management, and AI-powered spending analytics.',
    category: 'FinTech',
    status: 'active',
    priority: 'high',
    deadline: new Date('2026-12-01'),
    progressPercentage: 15,
  },
  {
    title: 'GreenRoute Logistics',
    description: 'An eco-friendly logistics platform that optimises delivery routes to minimise carbon emissions, tracks fleet in real-time, and generates sustainability reports.',
    category: 'Logistics',
    status: 'active',
    priority: 'medium',
    deadline: new Date('2026-10-10'),
    progressPercentage: 35,
  },
  {
    title: 'HireLink Recruitment',
    description: 'An end-to-end hiring platform connecting companies with top talent. Features AI resume screening, automated interview scheduling, and offer letter generation.',
    category: 'HR Tech',
    status: 'active',
    priority: 'medium',
    deadline: new Date('2026-08-31'),
    progressPercentage: 50,
  },
  {
    title: 'SmartHome IoT Hub',
    description: 'A centralised IoT management platform for smart home devices. Enables remote control of lighting, security cameras, thermostats, and appliances via a single dashboard.',
    category: 'IoT',
    status: 'paused',
    priority: 'low',
    deadline: new Date('2026-11-15'),
    progressPercentage: 22,
  },
  {
    title: 'CodeCollab IDE',
    description: 'A browser-based collaborative coding environment supporting 30+ languages, real-time pair programming, code review workflows, and integrated CI/CD pipeline management.',
    category: 'Developer Tools',
    status: 'active',
    priority: 'high',
    deadline: new Date('2026-09-01'),
    progressPercentage: 70,
  },
  {
    title: 'EventSphere Management',
    description: 'A full-featured event management platform for corporate and social events. Handles ticketing, attendee registration, vendor management, and live event analytics.',
    category: 'Events',
    status: 'completed',
    priority: 'medium',
    deadline: new Date('2026-04-30'),
    progressPercentage: 100,
  },
  {
    title: 'CyberShield Security Suite',
    description: 'An enterprise cybersecurity platform offering real-time threat detection, vulnerability scanning, compliance reporting, and automated incident response workflows.',
    category: 'Cybersecurity',
    status: 'active',
    priority: 'high',
    deadline: new Date('2026-11-30'),
    progressPercentage: 10,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user to set as createdBy
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.error('❌ No Admin user found. Please create an Admin account first.');
      process.exit(1);
    }
    console.log(`👤 Using Admin: ${admin.name} (${admin.email})`);

    let inserted = 0;
    for (const proj of projects) {
      const exists = await Project.findOne({ title: proj.title });
      if (exists) {
        console.log(`⏭️  Skipped (already exists): ${proj.title}`);
        continue;
      }
      await Project.create({ ...proj, createdBy: admin._id });
      console.log(`✅ Created: ${proj.title}`);
      inserted++;
    }

    console.log(`\n🎉 Done! ${inserted} new project(s) seeded.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
