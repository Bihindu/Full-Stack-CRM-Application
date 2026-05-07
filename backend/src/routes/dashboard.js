const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Status counts in one aggregation
    const statusAgg = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$dealValue' } } },
    ]);

    const byStatus = {};
    statusAgg.forEach(s => { byStatus[s._id] = s; });

    const get = (status, field) => byStatus[status]?.[field] || 0;

    const totalLeads    = await Lead.countDocuments();
    const totalValue    = statusAgg.reduce((s, r) => s + r.value, 0);
    const wonValue      = get('Won', 'value');
    const wonLeads      = get('Won', 'count');

    // By source
    const bySource = await Lead.aggregate([
      { $group: { _id: '$leadSource', count: { $sum: 1 }, value: { $sum: '$dealValue' } } },
      { $sort: { count: -1 } },
      { $project: { source: '$_id', count: 1, value: 1, _id: 0 } },
    ]);

    // By salesperson
    const bySalesperson = await Lead.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          leadCount: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
          wonCount: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', id: '$_id', leadCount: 1, totalValue: 1, wonCount: 1, _id: 0 } },
      { $sort: { leadCount: -1 } },
    ]);

    // Recent 5 leads
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .select('leadName companyName status dealValue updatedAt assignedTo');

    res.json({
      summary: {
        totalLeads,
        newLeads:       get('New', 'count'),
        contactedLeads: get('Contacted', 'count'),
        qualifiedLeads: get('Qualified', 'count'),
        proposalLeads:  get('Proposal Sent', 'count'),
        wonLeads,
        lostLeads:      get('Lost', 'count'),
        totalValue,
        wonValue,
        pipelineConversion: totalLeads > 0 ? +((wonLeads / totalLeads) * 100).toFixed(1) : 0,
      },
      bySource,
      bySalesperson,
      recentLeads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

module.exports = router;
