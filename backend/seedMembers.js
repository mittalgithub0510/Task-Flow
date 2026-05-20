import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const members = [
  { name: 'Aarav Sharma',     email: 'aarav.sharma@techflow.dev' },
  { name: 'Priya Mehta',      email: 'priya.mehta@taskflow.in' },
  { name: 'Rohan Verma',      email: 'rohan.verma@devhub.io' },
  { name: 'Sneha Patel',      email: 'sneha.patel@cloudsync.net' },
  { name: 'Arjun Nair',       email: 'arjun.nair@codebase.dev' },
  { name: 'Kavya Reddy',      email: 'kavya.reddy@appworks.in' },
  { name: 'Vikram Singh',     email: 'vikram.singh@nexatech.io' },
  { name: 'Ananya Iyer',      email: 'ananya.iyer@softplex.dev' },
  { name: 'Karan Joshi',      email: 'karan.joshi@bytecraft.in' },
  { name: 'Meera Pillai',     email: 'meera.pillai@stackup.io' },
  { name: 'Aditya Kumar',     email: 'aditya.kumar@launchpad.dev' },
  { name: 'Divya Nanda',      email: 'divya.nanda@webforge.in' },
  { name: 'Siddharth Rao',    email: 'siddharth.rao@pixelworks.io' },
  { name: 'Pooja Gupta',      email: 'pooja.gupta@codeflux.dev' },
  { name: 'Nikhil Bose',      email: 'nikhil.bose@devstream.in' },
  { name: 'Ishita Kapoor',    email: 'ishita.kapoor@apexdev.io' },
  { name: 'Manish Tiwari',    email: 'manish.tiwari@gridcode.dev' },
  { name: 'Shruti Agarwal',   email: 'shruti.agarwal@techlab.in' },
  { name: 'Rahul Desai',      email: 'rahul.desai@softnode.io' },
  { name: 'Nisha Malhotra',   email: 'nisha.malhotra@codewave.dev' },
  { name: 'Tarun Pandey',     email: 'tarun.pandey@buildfast.in' },
  { name: 'Ayesha Khan',      email: 'ayesha.khan@cloudbyte.io' },
  { name: 'Rajesh Sinha',     email: 'rajesh.sinha@devmatrix.dev' },
  { name: 'Lakshmi Menon',    email: 'lakshmi.menon@techpilot.in' },
  { name: 'Harsh Vardhan',    email: 'harsh.vardhan@stackforge.io' },
  { name: 'Ritu Saxena',      email: 'ritu.saxena@appnexus.dev' },
  { name: 'Ankur Mishra',     email: 'ankur.mishra@codevault.in' },
  { name: 'Tanvi Choudhary',  email: 'tanvi.choudhary@devpulse.io' },
  { name: 'Gaurav Bhatt',     email: 'gaurav.bhatt@techsprint.dev' },
  { name: 'Swati Dubey',      email: 'swati.dubey@launchbyte.in' },
  { name: 'Abhishek Yadav',   email: 'abhishek.yadav@bitbridge.io' },
  { name: 'Neha Jain',        email: 'neha.jain@codehive.dev' },
  { name: 'Vivek Chauhan',    email: 'vivek.chauhan@stackblaze.in' },
  { name: 'Pallavi Rao',      email: 'pallavi.rao@devnest.io' },
  { name: 'Suresh Pillai',    email: 'suresh.pillai@techroot.dev' },
  { name: 'Deepika Nair',     email: 'deepika.nair@appcraft.in' },
  { name: 'Mohit Bansal',     email: 'mohit.bansal@coderift.io' },
  { name: 'Ritika Sethi',     email: 'ritika.sethi@devhaven.dev' },
  { name: 'Pratik Shah',      email: 'pratik.shah@softlaunch.in' },
  { name: 'Sunita Dey',       email: 'sunita.dey@byteplex.io' },
  { name: 'Amit Thakur',      email: 'amit.thakur@techframe.dev' },
  { name: 'Preeti Ahuja',     email: 'preeti.ahuja@codespring.in' },
  { name: 'Saurabh Kulkarni', email: 'saurabh.kulkarni@apexcloud.io' },
  { name: 'Monika Shukla',    email: 'monika.shukla@devportal.dev' },
  { name: 'Yash Rastogi',     email: 'yash.rastogi@webpilot.in' },
  { name: 'Sakshi Srivastava',email: 'sakshi.srivastava@stackline.io' },
  { name: 'Kunal Batra',      email: 'kunal.batra@codexlab.dev' },
  { name: 'Aarti Prajapati',  email: 'aarti.prajapati@devgrid.in' },
  { name: 'Shivam Tomar',     email: 'shivam.tomar@techvault.io' },
  { name: 'Priyanka Menon',   email: 'priyanka.menon@appbuild.dev' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    let inserted = 0;
    let skipped = 0;

    for (const m of members) {
      const exists = await User.findOne({ email: m.email });
      if (exists) {
        console.log(`⏭️  Skipped (exists): ${m.name}`);
        skipped++;
        continue;
      }
      await User.create({
        name: m.name,
        email: m.email,
        password: '12345678',
        role: 'Member',
        performanceScore: 0,
      });
      console.log(`✅ Created: ${m.name} — ${m.email}`);
      inserted++;
    }

    console.log(`\n🎉 Done! ${inserted} member(s) created, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
