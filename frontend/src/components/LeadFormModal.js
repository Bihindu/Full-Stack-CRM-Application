import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { STATUSES, SOURCES } from './Common';
import { getUsers } from '../utils/api';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function LeadFormModal({ lead, onSave, onClose }) {
  const isEdit = !!lead;
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    leadName: '', companyName: '', email: '', phone: '',
    leadSource: 'Website', assignedTo: '', status: 'New',
    priority: 'Medium', dealValue: '', closeDate: '',
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUsers().then(res => setUsers(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (lead) {
      setForm({
        leadName:    lead.leadName    || '',
        companyName: lead.companyName || '',
        email:       lead.email       || '',
        phone:       lead.phone       || '',
        leadSource:  lead.leadSource  || 'Website',
        assignedTo:  lead.assignedTo?._id || lead.assignedTo || '',
        status:      lead.status      || 'New',
        priority:    lead.priority    || 'Medium',
        dealValue:   lead.dealValue   ?? '',
        closeDate:   lead.closeDate   ? new Date(lead.closeDate).toISOString().slice(0, 10) : '',
      });
    }
  }, [lead]);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        dealValue:  form.dealValue !== '' ? parseFloat(form.dealValue) : 0,
        assignedTo: form.assignedTo || null,
        closeDate:  form.closeDate  || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save lead.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Lead' : 'New Lead'}</h3>
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lead Name *</label>
                <input className="form-input" value={form.leadName}
                  onChange={e => set('leadName', e.target.value)} required placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input className="form-input" value={form.companyName}
                  onChange={e => set('companyName', e.target.value)} required placeholder="Acme Corp" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} required placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+1-555-0100" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lead Source *</label>
                <select className="form-select" value={form.leadSource}
                  onChange={e => set('leadSource', e.target.value)}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority}
                  onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expected Close Date</label>
                <input className="form-input" type="date" value={form.closeDate}
                  onChange={e => set('closeDate', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <select className="form-select" value={form.assignedTo}
                  onChange={e => set('assignedTo', e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Deal Value ($)</label>
                <input className="form-input" type="number" min="0" step="500"
                  value={form.dealValue} onChange={e => set('dealValue', e.target.value)}
                  placeholder="50000" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</>
                : isEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
