import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDashboard } from '../utils/api';
import { StatusBadge, formatCurrency, formatRelative, Spinner } from '../components/Common';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, Award, Target, ArrowRight } from 'lucide-react';

const PIE_COLORS = ['#4f8ef7','#a78bfa','#34d399','#fbbf24','#fb923c','#f87171'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.name === 'value' ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
        <Spinner /><span style={{ color: 'var(--text-3)' }}>Loading dashboard…</span>
      </div>
    </Layout>
  );

  const { summary, bySource, bySalesperson, recentLeads } = data;

  const pipelineData = [
    { name: 'New',      count: summary.newLeads,       color: 'var(--cyan)' },
    { name: 'Contacted',count: summary.contactedLeads, color: 'var(--amber)' },
    { name: 'Qualified',count: summary.qualifiedLeads, color: 'var(--purple)' },
    { name: 'Proposal', count: summary.proposalLeads,  color: '#fb923c' },
    { name: 'Won',      count: summary.wonLeads,       color: 'var(--green)' },
    { name: 'Lost',     count: summary.lostLeads,      color: 'var(--red)' },
  ];

  return (
    <Layout title="Dashboard">
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatTile label="Total Leads"    value={summary.totalLeads}            icon={<Users size={18} color="var(--accent)" />}    iconBg="var(--accent-glow)"  sub={`${summary.pipelineConversion}% win rate`} />
        <StatTile label="Pipeline Value" value={formatCurrency(summary.totalValue)} icon={<DollarSign size={18} color="var(--purple)" />} iconBg="var(--purple-bg)" sub="Total estimated" />
        <StatTile label="Won Revenue"    value={formatCurrency(summary.wonValue)}   icon={<Award size={18} color="var(--green)" />}     iconBg="var(--green-bg)"   sub={`${summary.wonLeads} deals closed`} />
        <StatTile label="Qualified"      value={summary.qualifiedLeads}         icon={<Target size={18} color="var(--amber)" />}    iconBg="var(--amber-bg)"   sub={`${summary.proposalLeads} proposals out`} />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>Pipeline Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="leads" radius={[6,6,0,0]}>
                {pipelineData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>Lead Sources</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={bySource} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={3}>
                  {bySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bySource.map((s, i) => (
                <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                  <span className="dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: 'var(--text-2)', flex: 1 }}>{s.source}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="section-title">Team Performance</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Salesperson</th><th>Leads</th><th>Won</th><th>Pipeline</th></tr></thead>
              <tbody>
                {bySalesperson.map(sp => (
                  <tr key={sp.id || sp.name}>
                    <td className="td-primary">{sp.name}</td>
                    <td>{sp.leadCount}</td>
                    <td><span style={{ color: 'var(--green)', fontWeight: 600 }}>{sp.wonCount}</span></td>
                    <td style={{ color: 'var(--accent)' }}>{formatCurrency(sp.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Leads</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View all <ArrowRight size={13} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentLeads.map(lead => (
              <div key={lead._id} className="card card-sm card-hover" style={{ padding: '12px 14px' }} onClick={() => navigate(`/leads/${lead._id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }} className="truncate">{lead.leadName}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{lead.companyName}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                    <StatusBadge status={lead.status} />
                    <p style={{ color: 'var(--accent)', fontSize: '0.78rem', marginTop: 4, fontWeight: 600 }}>{formatCurrency(lead.dealValue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatTile({ label, value, icon, iconBg, sub }) {
  return (
    <div className="stat-tile">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
