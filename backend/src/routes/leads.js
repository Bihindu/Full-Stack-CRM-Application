const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/leads
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, source, assigned_to, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status)      filter.status = status;
    if (source)      filter.leadSource = source;
    if (assigned_to) filter.assignedTo = assigned_to;
    if (req.query.priority)    filter.priority    = req.query.priority;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ leadName: rx }, { companyName: rx }, { email: rx }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-notes'),          // exclude notes in list view for performance
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

// GET /api/leads/:id  (includes notes)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ error: 'Lead not found.' });

    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('notes.createdBy', 'name');

    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lead.' });
  }
});

// POST /api/leads
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { leadName, companyName, email, phone, leadSource, assignedTo, status, dealValue } = req.body;

    if (!leadName || !companyName || !email || !leadSource)
      return res.status(400).json({ error: 'leadName, companyName, email, and leadSource are required.' });

    const lead = await Lead.create({
      leadName, companyName, email, phone,
      leadSource, status: status || 'New',
      dealValue: dealValue || 0,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    const populated = await lead.populate(['assignedTo', 'createdBy']);
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ error: 'Failed to create lead.' });
  }
});

// PUT /api/leads/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ error: 'Lead not found.' });

    const { leadName, companyName, email, phone, leadSource, assignedTo, status, dealValue } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { leadName, companyName, email, phone, leadSource, assignedTo: assignedTo || null, status, dealValue },
      { new: true, runValidators: true }
    ).populate(['assignedTo', 'createdBy']);

    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json(lead);
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    res.status(500).json({ error: 'Failed to update lead.' });
  }
});

// PATCH /api/leads/:id/status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json({ message: 'Status updated.', status: lead.status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ error: 'Lead not found.' });

    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json({ message: 'Lead deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead.' });
  }
});

// POST /api/leads/:id/notes
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Note content is required.' });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    const note = { content: content.trim(), createdBy: req.user.id, createdByName: req.user.name };
    lead.notes.unshift(note);         // newest first
    await lead.save();

    res.status(201).json(lead.notes[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note.' });
  }
});

// DELETE /api/leads/:id/notes/:noteId
router.delete('/:id/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    const note = lead.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    const isOwner = note.createdBy.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ error: 'You can only delete your own notes.' });

    note.deleteOne();
    await lead.save();
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

module.exports = router;

// GET /api/leads/export/csv — export filtered leads as CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const { status, source, assigned_to, search } = req.query;
    const filter = {};

    if (status)      filter.status = status;
    if (source)      filter.leadSource = source;
    if (assigned_to) filter.assignedTo = assigned_to;
    if (req.query.priority)    filter.priority    = req.query.priority;
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ leadName: rx }, { companyName: rx }, { email: rx }];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });

    // Build CSV
    const headers = [
      'Lead Name', 'Company', 'Email', 'Phone', 'Source',
      'Status', 'Priority', 'Deal Value', 'Assigned To',
      'Expected Close Date', 'Created Date', 'Last Updated'
    ];

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Wrap in quotes if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US') : '';

    const rows = leads.map(lead => [
      escape(lead.leadName),
      escape(lead.companyName),
      escape(lead.email),
      escape(lead.phone),
      escape(lead.leadSource),
      escape(lead.status),
      escape(lead.priority || 'Medium'),
      escape(lead.dealValue || 0),
      escape(lead.assignedTo?.name || 'Unassigned'),
      escape(formatDate(lead.closeDate)),
      escape(formatDate(lead.createdAt)),
      escape(formatDate(lead.updatedAt)),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `leads-export-${new Date().toISOString().slice(0,10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export leads.' });
  }
});
