const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../../crm.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'salesperson',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      lead_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      lead_source TEXT NOT NULL,
      assigned_to TEXT,
      status TEXT DEFAULT 'New',
      deal_value REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      created_by TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_by_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Seed default users
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const users = [
      { id: uuidv4(), name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
      { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah@example.com', password: hashedPassword, role: 'salesperson' },
      { id: uuidv4(), name: 'Marcus Chen', email: 'marcus@example.com', password: hashedPassword, role: 'salesperson' },
      { id: uuidv4(), name: 'Priya Patel', email: 'priya@example.com', password: hashedPassword, role: 'salesperson' },
    ];

    const insertUser = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
    for (const user of users) {
      insertUser.run(user.id, user.name, user.email, user.password, user.role);
    }

    // Seed sample leads
    const salespeople = db.prepare('SELECT id, name FROM users WHERE role = ?').all('salesperson');
    const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');

    const sampleLeads = [
      { name: 'James Whitfield', company: 'Apex Solutions', email: 'james@apex.com', phone: '+1-555-0101', source: 'LinkedIn', assigned: salespeople[0].id, status: 'Qualified', value: 42000 },
      { name: 'Lena Torres', company: 'Brightwave Tech', email: 'lena@brightwave.io', phone: '+1-555-0102', source: 'Website', assigned: salespeople[1].id, status: 'Proposal Sent', value: 87500 },
      { name: 'David Kim', company: 'NovaBridge Inc.', email: 'david@novabridge.com', phone: '+1-555-0103', source: 'Referral', assigned: salespeople[2].id, status: 'Won', value: 125000 },
      { name: 'Olivia March', company: 'GreenPath Corp', email: 'olivia@greenpath.com', phone: '+1-555-0104', source: 'Cold Email', assigned: salespeople[0].id, status: 'New', value: 18000 },
      { name: 'Rajiv Sharma', company: 'Cloudlink Systems', email: 'rajiv@cloudlink.com', phone: '+1-555-0105', source: 'Event', assigned: salespeople[1].id, status: 'Contacted', value: 63000 },
      { name: 'Emily Park', company: 'Ironclad Media', email: 'emily@ironclad.media', phone: '+1-555-0106', source: 'LinkedIn', assigned: salespeople[2].id, status: 'Lost', value: 32000 },
      { name: 'Carlos Rivera', company: 'FastTrack Logistics', email: 'carlos@fasttrack.com', phone: '+1-555-0107', source: 'Website', assigned: salespeople[0].id, status: 'New', value: 51000 },
      { name: 'Nina Okafor', company: 'Stellaris Analytics', email: 'nina@stellaris.ai', phone: '+1-555-0108', source: 'Referral', assigned: salespeople[1].id, status: 'Qualified', value: 94000 },
      { name: 'Tom Fletcher', company: 'BlueSky Ventures', email: 'tom@bluesky.vc', phone: '+1-555-0109', source: 'Cold Email', assigned: salespeople[2].id, status: 'Won', value: 210000 },
      { name: 'Aisha Bello', company: 'PrimeCast Studios', email: 'aisha@primecast.com', phone: '+1-555-0110', source: 'Event', assigned: salespeople[0].id, status: 'Contacted', value: 27000 },
    ];

    const insertLead = db.prepare(`
      INSERT INTO leads (id, lead_name, company_name, email, phone, lead_source, assigned_to, status, deal_value, created_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertNote = db.prepare(`
      INSERT INTO notes (id, lead_id, content, created_by, created_by_name)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const lead of sampleLeads) {
      const leadId = uuidv4();
      insertLead.run(leadId, lead.name, lead.company, lead.email, lead.phone, lead.source, lead.assigned, lead.status, lead.value, admin.id);

      // Add a sample note to each lead
      insertNote.run(uuidv4(), leadId, `Initial contact made. ${lead.company} expressed interest in our enterprise plan.`, admin.id, 'Admin User');
    }

    console.log('✅ Database seeded with sample data');
  }

  console.log('✅ Database initialized');
}

module.exports = { getDb, initDb };