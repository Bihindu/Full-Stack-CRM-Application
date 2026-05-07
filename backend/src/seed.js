require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pipelinecrm';

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Lead.deleteMany({});
  console.log('Cleared existing data');

  const users = await User.create([
    { name: 'Admin User',    email: 'admin@example.com',  password: 'password123', role: 'admin' },
    { name: 'Sarah Johnson', email: 'sarah@example.com',  password: 'password123', role: 'salesperson' },
    { name: 'Marcus Chen',   email: 'marcus@example.com', password: 'password123', role: 'salesperson' },
    { name: 'Priya Patel',   email: 'priya@example.com',  password: 'password123', role: 'salesperson' },
  ]);

  const [admin, sarah, marcus, priya] = users;

  const sampleLeads = [
    { leadName: 'James Whitfield', companyName: 'Apex Solutions',      email: 'james@apex.com',       phone: '+1-555-0101', leadSource: 'LinkedIn',   assignedTo: sarah._id,  status: 'Qualified',     priority: 'High',   closeDate: daysFromNow(14),  dealValue: 42000  },
    { leadName: 'Lena Torres',     companyName: 'Brightwave Tech',     email: 'lena@brightwave.io',   phone: '+1-555-0102', leadSource: 'Website',    assignedTo: marcus._id, status: 'Proposal Sent', priority: 'High',   closeDate: daysFromNow(7),   dealValue: 87500  },
    { leadName: 'David Kim',       companyName: 'NovaBridge Inc.',     email: 'david@novabridge.com', phone: '+1-555-0103', leadSource: 'Referral',   assignedTo: priya._id,  status: 'Won',           priority: 'Medium', closeDate: daysFromNow(-5),  dealValue: 125000 },
    { leadName: 'Olivia March',    companyName: 'GreenPath Corp',      email: 'olivia@greenpath.com', phone: '+1-555-0104', leadSource: 'Cold Email', assignedTo: sarah._id,  status: 'New',           priority: 'Low',    closeDate: daysFromNow(30),  dealValue: 18000  },
    { leadName: 'Rajiv Sharma',    companyName: 'Cloudlink Systems',   email: 'rajiv@cloudlink.com',  phone: '+1-555-0105', leadSource: 'Event',      assignedTo: marcus._id, status: 'Contacted',     priority: 'Medium', closeDate: daysFromNow(21),  dealValue: 63000  },
    { leadName: 'Emily Park',      companyName: 'Ironclad Media',      email: 'emily@ironclad.media', phone: '+1-555-0106', leadSource: 'LinkedIn',   assignedTo: priya._id,  status: 'Lost',          priority: 'Low',    closeDate: null,             dealValue: 32000  },
    { leadName: 'Carlos Rivera',   companyName: 'FastTrack Logistics', email: 'carlos@fasttrack.com', phone: '+1-555-0107', leadSource: 'Website',    assignedTo: sarah._id,  status: 'New',           priority: 'High',   closeDate: daysFromNow(-2),  dealValue: 51000  },
    { leadName: 'Nina Okafor',     companyName: 'Stellaris Analytics', email: 'nina@stellaris.ai',    phone: '+1-555-0108', leadSource: 'Referral',   assignedTo: marcus._id, status: 'Qualified',     priority: 'High',   closeDate: daysFromNow(10),  dealValue: 94000  },
    { leadName: 'Tom Fletcher',    companyName: 'BlueSky Ventures',    email: 'tom@bluesky.vc',       phone: '+1-555-0109', leadSource: 'Cold Email', assignedTo: priya._id,  status: 'Won',           priority: 'Medium', closeDate: daysFromNow(-10), dealValue: 210000 },
    { leadName: 'Aisha Bello',     companyName: 'PrimeCast Studios',   email: 'aisha@primecast.com',  phone: '+1-555-0110', leadSource: 'Event',      assignedTo: sarah._id,  status: 'Contacted',     priority: 'Medium', closeDate: daysFromNow(45),  dealValue: 27000  },
  ];

  for (const data of sampleLeads) {
    await Lead.create({
      ...data,
      createdBy: admin._id,
      notes: [{
        content: `Initial contact made. ${data.companyName} expressed interest in our enterprise plan.`,
        createdBy: admin._id,
        createdByName: 'Admin User',
      }],
    });
  }

  console.log('✅ Seeded 4 users and 10 leads with priority and close dates');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
