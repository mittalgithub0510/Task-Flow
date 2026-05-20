import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import Project from './models/Project.js';
import User from './models/User.js';

dotenv.config();

// Task templates per project category
const taskTemplates = [
  // EduSync Platform
  { projectTitle: 'EduSync Platform', tasks: [
    { title: 'Design Student Dashboard UI', description: 'Create wireframes and high-fidelity mockups for the student dashboard including course progress, upcoming assignments, and grade overview sections.', priority: 'high', status: 'approved', dueOffset: -10 },
    { title: 'Build Course Enrollment API', description: 'Develop REST API endpoints for course enrollment, withdrawal, and waitlist management with capacity limits and prerequisite checks.', priority: 'high', status: 'in-progress', dueOffset: 15 },
    { title: 'Implement Attendance Tracking Module', description: 'Create an automated attendance tracking system with QR code check-in, manual override for instructors, and monthly attendance reports.', priority: 'medium', status: 'todo', dueOffset: 25 },
    { title: 'Integrate Video Lecture Player', description: 'Embed a responsive video player supporting HLS streaming, playback speed control, subtitle support, and progress bookmarking.', priority: 'medium', status: 'submitted', dueOffset: 5 },
  ]},

  // MediTrack Pro
  { projectTitle: 'MediTrack Pro', tasks: [
    { title: 'Patient Registration Flow', description: 'Build a multi-step patient registration form with ABHA ID integration, insurance details, emergency contacts, and medical history upload.', priority: 'high', status: 'approved', dueOffset: -5 },
    { title: 'Appointment Scheduling System', description: 'Develop a doctor availability calendar with time-slot booking, SMS/email reminders, cancellation handling, and rescheduling logic.', priority: 'high', status: 'in-progress', dueOffset: 10 },
    { title: 'Prescription Management Module', description: 'Create a digital prescription system where doctors can generate, sign, and send prescriptions directly to integrated pharmacy partners.', priority: 'high', status: 'todo', dueOffset: 20 },
    { title: 'Lab Reports Integration', description: 'Integrate with third-party diagnostic labs via API to fetch and display patient lab reports directly within their health records timeline.', priority: 'medium', status: 'rejected', dueOffset: -15 },
  ]},

  // RetailPulse Analytics
  { projectTitle: 'RetailPulse Analytics', tasks: [
    { title: 'Sales Performance Dashboard', description: 'Build an interactive dashboard showing daily/weekly/monthly sales trends, top-selling products, and regional performance comparisons with chart exports.', priority: 'high', status: 'approved', dueOffset: -8 },
    { title: 'Inventory Forecasting Engine', description: 'Implement ML-based demand forecasting to predict stock requirements, auto-generate purchase orders, and alert for low-stock situations.', priority: 'high', status: 'in-progress', dueOffset: 18 },
    { title: 'Customer Segmentation Module', description: 'Analyse customer purchase behaviour to create RFM segments and build targeted marketing campaign lists exportable to CRM tools.', priority: 'medium', status: 'todo', dueOffset: 30 },
  ]},

  // FinVault Banking App
  { projectTitle: 'FinVault Banking App', tasks: [
    { title: 'Biometric Authentication Setup', description: 'Implement fingerprint and Face ID authentication for app login and high-value transaction confirmation using device-native biometric APIs.', priority: 'high', status: 'in-progress', dueOffset: 20 },
    { title: 'Fund Transfer Module', description: 'Build NEFT/RTGS/IMPS transfer flows with beneficiary management, transfer limits, OTP verification, and transaction history with filters.', priority: 'high', status: 'todo', dueOffset: 35 },
    { title: 'AI Spending Analyser', description: 'Develop a personal finance module that categorises transactions, shows monthly spending trends, and provides AI-generated saving recommendations.', priority: 'medium', status: 'todo', dueOffset: 45 },
    { title: 'Loan Application Portal', description: 'Create a self-service loan application system with eligibility checks, document uploads, EMI calculators, and real-time application status tracking.', priority: 'high', status: 'submitted', dueOffset: 8 },
  ]},

  // GreenRoute Logistics
  { projectTitle: 'GreenRoute Logistics', tasks: [
    { title: 'Route Optimisation Algorithm', description: 'Implement a multi-stop delivery route optimiser using the Travelling Salesman Problem heuristic to reduce fuel consumption and delivery time.', priority: 'high', status: 'in-progress', dueOffset: 12 },
    { title: 'Real-time Fleet Tracker', description: 'Integrate GPS tracking for all fleet vehicles with live map view, speed monitoring, geofence alerts, and historical route playback for managers.', priority: 'high', status: 'approved', dueOffset: -3 },
    { title: 'Carbon Emissions Report', description: 'Build an automated monthly emissions report calculating CO2 saved per optimised route, with comparison charts and exportable PDF summaries.', priority: 'medium', status: 'todo', dueOffset: 22 },
  ]},

  // HireLink Recruitment
  { projectTitle: 'HireLink Recruitment', tasks: [
    { title: 'AI Resume Screening Engine', description: 'Build an NLP-powered resume parser that extracts skills, experience, and education, then ranks candidates against job description requirements automatically.', priority: 'high', status: 'in-progress', dueOffset: 14 },
    { title: 'Interview Scheduling Automation', description: 'Create a smart calendar integration that syncs interviewer availability, sends candidate invites, handles reschedules, and sends post-interview feedback forms.', priority: 'high', status: 'submitted', dueOffset: 6 },
    { title: 'Offer Letter Generator', description: 'Design a template-based offer letter generation system with dynamic salary details, role information, joining date, and e-signature integration.', priority: 'medium', status: 'todo', dueOffset: 28 },
    { title: 'Job Portal Frontend', description: 'Build a public-facing job listings page with search, filters by location/role/salary, and a one-click apply feature for registered candidates.', priority: 'medium', status: 'approved', dueOffset: -7 },
  ]},

  // SmartHome IoT Hub
  { projectTitle: 'SmartHome IoT Hub', tasks: [
    { title: 'Device Pairing Module', description: 'Build a device discovery and pairing system supporting Wi-Fi, Zigbee, and Z-Wave protocols with a step-by-step guided setup wizard in the app.', priority: 'medium', status: 'todo', dueOffset: 40 },
    { title: 'Automation Rules Engine', description: 'Develop a visual rule builder where users can create if-then automations (e.g., "If motion detected after 10pm, turn on lights and send alert").', priority: 'medium', status: 'in-progress', dueOffset: 50 },
    { title: 'Energy Usage Dashboard', description: 'Create a real-time energy consumption monitor per device with monthly cost estimates, usage patterns, and power-saving recommendations.', priority: 'low', status: 'todo', dueOffset: 60 },
  ]},

  // CodeCollab IDE
  { projectTitle: 'CodeCollab IDE', tasks: [
    { title: 'Real-time Code Sync Engine', description: 'Implement operational transformation or CRDT-based real-time code synchronisation between multiple users editing the same file simultaneously.', priority: 'high', status: 'approved', dueOffset: -12 },
    { title: 'Language Server Protocol Integration', description: 'Integrate LSP support for JavaScript, Python, Go, and Java to provide intelligent code completion, error highlighting, and hover documentation.', priority: 'high', status: 'in-progress', dueOffset: 8 },
    { title: 'CI/CD Pipeline Configuration UI', description: 'Build a visual pipeline builder where teams can configure build, test, and deployment stages with drag-and-drop steps and YAML export.', priority: 'medium', status: 'submitted', dueOffset: 3 },
    { title: 'Code Review Workflow', description: 'Create an inline commenting system on code diffs, with review approval workflows, suggested changes, and merge request management.', priority: 'high', status: 'todo', dueOffset: 15 },
  ]},

  // EventSphere Management
  { projectTitle: 'EventSphere Management', tasks: [
    { title: 'Ticketing & Registration System', description: 'Build an event ticketing platform with multiple ticket tiers, promo codes, group bookings, PDF ticket generation, and QR code check-in at the venue.', priority: 'high', status: 'approved', dueOffset: -20 },
    { title: 'Vendor Management Portal', description: 'Create a portal for event vendors to submit proposals, upload contracts, track payment milestones, and communicate with event organisers.', priority: 'medium', status: 'approved', dueOffset: -25 },
    { title: 'Live Event Analytics Board', description: 'Build a real-time dashboard showing check-in counts, session attendance, audience feedback scores, and social media mentions during live events.', priority: 'medium', status: 'approved', dueOffset: -18 },
  ]},

  // CyberShield Security Suite
  { projectTitle: 'CyberShield Security Suite', tasks: [
    { title: 'Threat Intelligence Feed Integration', description: 'Connect to global threat intelligence APIs (VirusTotal, Shodan, MISP) to enrich security alerts with real-time threat actor data and CVE information.', priority: 'high', status: 'todo', dueOffset: 30 },
    { title: 'Vulnerability Scanner Module', description: 'Build an automated network and application vulnerability scanner with severity scoring, false positive management, and remediation guidance per finding.', priority: 'high', status: 'in-progress', dueOffset: 20 },
    { title: 'Compliance Reporting Engine', description: 'Develop automated compliance report generation for ISO 27001, SOC 2, and GDPR frameworks with control mapping and audit trail exports.', priority: 'high', status: 'todo', dueOffset: 45 },
    { title: 'Incident Response Playbooks', description: 'Create a guided incident response system with pre-built playbooks for ransomware, data breach, and DDoS scenarios with task assignment to analysts.', priority: 'high', status: 'todo', dueOffset: 35 },
  ]},

  // DocuShare Cloud (existing)
  { projectTitle: 'DocuShare Cloud', tasks: [
    { title: 'File Version Control System', description: 'Implement document versioning with full revision history, diff viewer, rollback capability, and named version tagging for official document releases.', priority: 'high', status: 'in-progress', dueOffset: 10 },
    { title: 'Collaborative Editing Module', description: 'Enable multi-user real-time document editing with presence indicators, comment threads, suggestion mode, and change tracking like Google Docs.', priority: 'high', status: 'todo', dueOffset: 22 },
    { title: 'Document Search & Indexing', description: 'Build full-text search across all stored documents including OCR-scanned PDFs, with filters by date, author, file type, and custom metadata tags.', priority: 'medium', status: 'submitted', dueOffset: 4 },
  ]},

  // LearnSphere LMS (existing)
  { projectTitle: 'LearnSphere LMS', tasks: [
    { title: 'Course Builder Interface', description: 'Design a drag-and-drop course creation interface for instructors to add video lessons, quizzes, assignments, and downloadable resources in any order.', priority: 'high', status: 'in-progress', dueOffset: 12 },
    { title: 'Gamification & Badges System', description: 'Implement a points and badge system rewarding learners for completing lessons, scoring high on quizzes, and maintaining daily learning streaks.', priority: 'medium', status: 'todo', dueOffset: 25 },
    { title: 'Live Class Integration', description: 'Integrate with Zoom and Google Meet APIs to schedule and launch live virtual classes directly from within the LMS with attendance auto-recording.', priority: 'high', status: 'approved', dueOffset: -6 },
  ]},

  // BugTrack Pro (existing)
  { projectTitle: 'BugTrack Pro', tasks: [
    { title: 'Bug Report Submission Form', description: 'Build a detailed bug submission form with severity classification, environment details, reproduction steps, screenshot upload, and auto-assignment rules.', priority: 'high', status: 'approved', dueOffset: -4 },
    { title: 'Sprint Board & Backlog View', description: 'Implement a Kanban-style sprint board with drag-and-drop status updates, story point estimation, sprint velocity charts, and backlog prioritisation.', priority: 'high', status: 'in-progress', dueOffset: 8 },
    { title: 'GitHub Integration for Bug Linking', description: 'Connect BugTrack to GitHub repositories so bugs can be linked to commits, pull requests, and branches with automatic status updates on merge.', priority: 'medium', status: 'todo', dueOffset: 20 },
    { title: 'Bug Analytics & Trends Report', description: 'Create a reporting module showing bug resolution rates, average fix time per severity, recurring bug patterns, and team performance metrics over time.', priority: 'medium', status: 'submitted', dueOffset: 2 },
  ]},
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) { console.error('❌ No Admin found.'); process.exit(1); }

    const allMembers = await User.find({ role: 'Member' });
    if (allMembers.length === 0) { console.error('❌ No Members found.'); process.exit(1); }

    console.log(`👤 Admin: ${admin.name}`);
    console.log(`👥 Members available: ${allMembers.length}\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const group of taskTemplates) {
      const project = await Project.findOne({ title: group.projectTitle });
      if (!project) {
        console.log(`⚠️  Project not found: "${group.projectTitle}" — skipping`);
        continue;
      }

      console.log(`\n📁 Project: ${project.title}`);

      for (const t of group.tasks) {
        const exists = await Task.findOne({ title: t.title, project: project._id });
        if (exists) {
          console.log(`  ⏭️  Skipped (exists): ${t.title}`);
          totalSkipped++;
          continue;
        }

        // Assign to 1–3 random members
        const count = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...allMembers].sort(() => 0.5 - Math.random());
        const assignedTo = shuffled.slice(0, count).map(m => m._id);

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + t.dueOffset);

        await Task.create({
          title: t.title,
          description: t.description,
          projectId: project._id,
          assignedTo,
          assignmentType: count === 1 ? 'single' : 'multiple',
          assignedBy: admin._id,
          status: t.status,
          priority: t.priority,
          dueDate,
        });

        console.log(`  ✅ Created: ${t.title} [${t.status}] → ${assignedTo.length} member(s)`);
        totalCreated++;
      }
    }

    console.log(`\n🎉 Done! ${totalCreated} task(s) created, ${totalSkipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
