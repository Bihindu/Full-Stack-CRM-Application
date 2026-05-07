import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LeadFormModal from '../components/LeadFormModal';
import {
  StatusBadge, PriorityBadge, CloseDateBadge, SourceChip,
  formatCurrency, formatRelative, Spinner, STATUSES, SOURCES, PRIORITIES
} from '../components/Common';
import { getLeads, createLead, deleteLead, getUsers } from '../utils/api';
import { Plus, Search, Trash2, Eye, Users, Download } from 'lucide-react';

function isOverdue(closeDate, status) {
  if (!closeDate || status === 'Won' || status === 'Lost') return false;
  return new Date(closeDate) < new Date();
}

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads]           = useState([]);
  const [pagination, setPagination] = useState({});
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [exporting, setExporting]   = useState(false);

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterSource, setFilterSource]   = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const buildParams = useCallback(() => {
    const p = {};
    if (search)         p.search      = search;
    if (filterStatus)   p.status      = filterStatus;
    if (filterSource)   p.source      = filterSource;
    if (filterAssigned) p.assigned_to = filterAssigned;
    if (filterPriority) p.priority    = filterPriority;
    return p;
  }, [search, filterStatus, filterSource, filterAssigned, filterPriority]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads(buildParams());
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [buildParams]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { getUsers().then(r => setUsers(r.data)).catch(console.error); }, []);

  async function handleCreate(data) { await createLead(data); fetchLeads(); }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this lead and all its notes?')) return;
    setDeleting(id);
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l._id !== id));
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete.'); }
    finally { setDeleting(null); }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const params = new URLSearchParams(buildParams()).toString();
      const token  = localStorage.getItem('crm_token');
      const res    = await fetch(`/api/leads/export/csv${params ? '?' + params : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `leads-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert('Failed to export CSV.'); }
    finally { setExporting(false); }
  }

  const activeFilters = [filterStatus, filterSource, filterAssigned, filterPriority].filter(Boolean).length;

  return (
    <Layout title="Leads" actions={
      <>
        <button className="btn btn-ghost" onClick={handleExportCSV} disabled={exporting} title="Export current view to CSV">
          {exporting
            ? <span className="spinner" style={{ width: 14, height: 14 }} />
            : <Download size={15} />}
          Export CSV
        </button>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Lead
        </button>
      </>
    }>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrap">
          <Search size={15} />
          <input className="search-input" placeholder="Search leads…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-bar">
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}>
            <option value="">All Salespeople</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          {activeFilters > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setFilterStatus(''); setFilterSource('');
              setFilterAssigned(''); setFilterPriority('');
            }}>
              Clear ({activeFilters})
            </button>
          )}
        </div>
        <div className="ml-auto" style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
          {pagination.total ?? 0} leads
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: 'var(--text-3)' }}>
            <Spinner /> Loading leads…
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <Users size={40} strokeWidth={1.2} />
            <h3>No leads found</h3>
            <p>Try adjusting your filters or create your first lead.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lead / Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Close Date</th>
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Deal Value</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const overdue = isOverdue(lead.closeDate, lead.status);
                  return (
                    <tr key={lead._id} style={{ cursor: 'pointer', background: overdue ? 'rgba(248,113,113,0.04)' : undefined }}
                      onClick={() => navigate(`/leads/${lead._id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {overdue && (
                            <span title="Overdue" style={{ color: 'var(--red)', fontSize: '0.7rem', fontWeight: 800 }}>!</span>
                          )}
                          <div>
                            <div className="td-primary">{lead.leadName}</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: 2 }}>{lead.companyName}</div>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td><PriorityBadge priority={lead.priority} /></td>
                      <td><CloseDateBadge closeDate={lead.closeDate} /></td>
                      <td><SourceChip source={lead.leadSource} /></td>
                      <td>{lead.assignedTo?.name || <span className="val-muted">Unassigned</span>}</td>
                      <td className="val-green">{formatCurrency(lead.dealValue)}</td>
                      <td className="val-muted text-xs">{formatRelative(lead.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          <button className="btn btn-icon btn-sm" title="View"
                            onClick={() => navigate(`/leads/${lead._id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-icon btn-sm" title="Delete"
                            onClick={e => handleDelete(e, lead._id)} disabled={deleting === lead._id}
                            style={{ color: 'var(--red)' }}>
                            {deleting === lead._id
                              ? <span className="spinner" style={{ width: 12, height: 12 }} />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <LeadFormModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
