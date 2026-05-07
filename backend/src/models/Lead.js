const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content:       { type: String, required: true, trim: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
  leadName:     { type: String, required: true, trim: true },
  companyName:  { type: String, required: true, trim: true },
  email:        { type: String, required: true, trim: true, lowercase: true },
  phone:        { type: String, trim: true, default: '' },
  leadSource:   {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'],
    required: true,
  },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:       {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New',
  },
  priority:     { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  closeDate:    { type: Date, default: null },
  dealValue:    { type: Number, default: 0, min: 0 },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes:        [noteSchema],
}, { timestamps: true });

// Text index for search
leadSchema.index({ leadName: 'text', companyName: 'text', email: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
