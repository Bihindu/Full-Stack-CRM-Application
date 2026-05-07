import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, LogOut, Zap, ChevronRight
} from 'lucide-react';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout({ children, title, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: 'var(--accent-glow)',
              border: '1px solid rgba(79,142,247,0.3)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} color="var(--accent)" strokeWidth={2.5} />
            </div>
            <h1>Pipeline<span>CRM</span></h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={17} />
            Leads
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip" onClick={handleLogout} title="Click to log out">
            <div className="avatar">{initials(user?.name)}</div>
            <div className="user-info">
              <div className="user-name truncate">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <LogOut size={15} color="var(--text-3)" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <header className="page-header">
          <h2>{title}</h2>
          {actions && <div className="header-actions">{actions}</div>}
        </header>
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
