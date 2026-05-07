import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LeadFormModal from '../components/LeadFormModal';
import {
  StatusBadge, PriorityBadge, SourceChip, CloseDateBadge,
  formatCurrency, formatDate, formatRelative, Spinner, STATUSES
} from '../components/Common';
import { getLead, updateLead, updateLeadStatus, deleteLead, addNote, deleteNote } from '../utils/api';
import {
  ArrowLeft, Edit2, Trash2, Mail, Phone, Building2,
  User, Calendar, RefreshCw, MessageSquare, Send, X, Target, Flag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showEdit, setShowEdit]       = useState(false);
  const [noteText, setNoteText]       = useState('');
  const [addingNote, setAddingNote]   = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);

  function fetchLead() {
    getLead(id)
      .then(res => setLead(res.data))
      .catch(err => { if (err.response?.status === 404) navigate('/leads'); })
      .finally(() => setLoading(false));
  }
  useEffect(() => { fetchLead(); }, [id]);

  async function handleStatusChange(e) {
    try {
      await updateLeadStatus(id, e.target.value);
      setLead(prev => ({ ...prev, status: e.target.value }));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update status.'); }
  }

  async function handleEdit(data) {
    const res = await updateLead(id, data);
    setLead(prev => ({ ...prev, ...res.data }));
  }

  async function handleDelete() {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    await deleteLead(id);
    navigate('/leads');
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await addNote(id, noteText.trim());
      setLead(prev => ({ ...prev, notes: [res.data, ...(prev.notes || [])] }));
      setNoteText('');
    } catch (err) { alert(err.response?.data?.error || 'Failed to add note.'); }
    finally { setAddingNote(false); }
  }

  async function handleDeleteNote(noteId) {
    setDeletingNote(noteId);
    try {
      await deleteNote(id, noteId);
      setLead(prev => ({ ...prev, notes: prev.notes.filter(n => n._id !== noteId) }));
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete note.'); }
    finally { setDeletingNote(null); }
  }

  if (loading) return (
    <Layout title="Lead Detail">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
        <Spinner /><span style={{ color: 'var(--text-3)' }}>Loading…</span>
      </div>
    </Layout>
  );
  if (!lead) return null;

  return (
    <Layout title={lead.leadName} actions={
      <>
        <button className="btn btn-ghost" onClick={() => navigate('/leads')}><ArrowLeft size={15} /> Back</button>
        <button className="btn btn-ghost" onClick={() => setShowEdit(true)}><Edit2 size={14} /> Edit</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
      </>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Lead info card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
                  {lead.leadName}
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <SourceChip source={lead.leadSource} />
                  <StatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>
                  {formatCurrency(lead.dealValue)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>Estimated value</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <InfoRow icon={<Building2 size={14} />} label="Company"    value={lead.companyName} />
              <InfoRow icon={<Mail size={14} />}      label="Email"      value={<a href={`mailto:${lead.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{lead.email}</a>} />
              <InfoRow icon={<Phone size={14} />}     label="Phone"      value={lead.phone || '—'} />
              <InfoRow icon={<User size={14} />}      label="Assigned To" value={lead.assignedTo?.name || 'Unassigned'} />
              <InfoRow icon={<Flag size={14} />}      label="Priority"   value={<PriorityBadge priority={lead.priority} />} />
              <InfoRow icon={<Target size={14} />}    label="Close Date" value={<CloseDateBadge closeDate={lead.closeDate} />} />
              <InfoRow icon={<Calendar size={14} />}  label="Created"    value={formatDate(lead.createdAt)} />
              <InfoRow icon={<RefreshCw size={14} />} label="Updated"    value={formatRelative(lead.updatedAt)} />
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} color="var(--accent)" />
              Notes
              <span style={{ marginLeft: 4, fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
                ({(lead.notes || []).length})
              </span>
            </h3>

            <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea className="form-textarea" placeholder="Add a note about this lead…"
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  style={{ minHeight: 70, flex: 1 }} />
                <button type="submit" className="btn btn-primary"
                  disabled={addingNote || !noteText.trim()} style={{ alignSelf: 'flex-end' }}>
                  {addingNote ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={14} />}
                </button>
              </div>
            </form>

            {(lead.notes || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>
                No notes yet. Add the first one!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(lead.notes || []).map(note => (
                  <div key={note._id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {note.createdByName?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{note.createdByName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{formatRelative(note.createdAt)}</span>
                        {(note.createdBy === user.id || note.createdBy?._id === user.id || user.role === 'admin') && (
                          <button className="btn btn-icon" style={{ padding: 4, width: 24, height: 24 }}
                            onClick={() => handleDeleteNote(note._id)} disabled={deletingNote === note._id}>
                            {deletingNote === note._id
                              ? <span className="spinner" style={{ width: 10, height: 10 }} />
                              : <X size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status control */}
          <div className="card">
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Lead Status
            </h4>
            <select className="form-select" value={lead.status} onChange={handleStatusChange}
              style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STATUSES.map((s, i) => {
                const ci = STATUSES.indexOf(lead.status);
                const isPast = i < ci, isCurrent = i === ci;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, background: isCurrent ? 'var(--accent-glow)' : 'transparent', opacity: isPast ? 0.4 : 1 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isCurrent ? 'var(--accent)' : isPast ? 'var(--text-3)' : 'var(--border-2)' }} />
                    <span style={{ fontSize: '0.8rem', color: isCurrent ? 'var(--accent)' : 'var(--text-3)', fontWeight: isCurrent ? 700 : 400 }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick summary */}
          <div className="card">
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
              Lead Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SummaryRow label="Deal Value"  value={<span style={{ color: 'var(--green)', fontWeight: 700 }}>{formatCurrency(lead.dealValue)}</span>} />
              <SummaryRow label="Priority"    value={<PriorityBadge priority={lead.priority} />} />
              <SummaryRow label="Close Date"  value={<CloseDateBadge closeDate={lead.closeDate} />} />
              <SummaryRow label="Source"      value={lead.leadSource} />
              <SummaryRow label="Created by"  value={lead.createdBy?.name || '—'} />
              <SummaryRow label="Notes"       value={`${(lead.notes || []).length}`} />
            </div>
          </div>
        </div>
      </div>

      {showEdit && <LeadFormModal lead={lead} onSave={handleEdit} onClose={() => setShowEdit(false)} />}
    </Layout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{icon} {label}</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
