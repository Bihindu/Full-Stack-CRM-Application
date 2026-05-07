import React from 'react';

const STATUS_CONFIG = {
  'New':           { cls: 'badge-new',      dot: 'var(--cyan)' },
  'Contacted':     { cls: 'badge-contacted', dot: 'var(--amber)' },
  'Qualified':     { cls: 'badge-qualified', dot: 'var(--purple)' },
  'Proposal Sent': { cls: 'badge-proposal',  dot: '#fb923c' },
  'Won':           { cls: 'badge-won',       dot: 'var(--green)' },
  'Lost':          { cls: 'badge-lost',      dot: 'var(--red)' },
};

const PRIORITY_CONFIG = {
  'High':   { color: 'var(--red)',    bg: 'var(--red-bg)',    icon: '▲' },
  'Medium': { color: 'var(--amber)',  bg: 'var(--amber-bg)',  icon: '●' },
  'Low':    { color: 'var(--text-3)', bg: 'var(--bg-4)',      icon: '▼' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: '', dot: 'var(--text-3)' };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className="dot" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority = 'Medium' }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Medium'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {priority}
    </span>
  );
}

export function CloseDateBadge({ closeDate }) {
  if (!closeDate) return <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>—</span>;

  const date   = new Date(closeDate);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const diff   = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  const isOverdue  = diff < 0;
  const isDueSoon  = diff >= 0 && diff <= 7;

  let color = 'var(--text-2)';
  let label = '';
  if (isOverdue)  { color = 'var(--red)';   label = ` (${Math.abs(diff)}d overdue)`; }
  else if (isDueSoon) { color = 'var(--amber)'; label = ` (${diff}d left)`; }

  return (
    <span style={{ fontSize: '0.82rem', color, fontWeight: isOverdue || isDueSoon ? 600 : 400 }}>
      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      {label}
    </span>
  );
}

export function SourceChip({ source }) {
  return <span className="chip">{source}</span>;
}

export function formatCurrency(val) {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function Spinner({ size = 24 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export const STATUSES   = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const SOURCES    = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
