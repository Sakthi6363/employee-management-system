import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name) =>
    (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const link = (to, icon, label) => (
    <NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <i className={`bi ${icon}`}></i> {label}
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-people-fill text-white" style={{ fontSize: '1rem' }}></i>
          </div>
          <div>
            <h5 className="mb-0">EMS</h5>
            <small>Employee Management</small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        {link('/dashboard', 'bi-grid-1x2-fill', 'Dashboard')}

        {/* Employees — visible to all authenticated users */}
        {link('/employees', 'bi-people-fill', 'Employees')}

        {/* Admin-only section */}
        {isAdmin() && (
          <>
            <div className="nav-section-title mt-2">Admin Panel</div>
            {link('/users',     'bi-shield-person-fill',  'User Management')}
            {link('/audit-logs','bi-journal-text',         'Audit Logs')}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{
            background: isAdmin()
              ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
              : 'linear-gradient(135deg,#3b82f6,#06b6d4)'
          }}>
            {initials(user?.name)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {isAdmin() ? '👑 Admin' : '👤 User'}
              {user?.admin_id && (
                <span className="ms-1" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                  ({user.admin_id})
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-sm w-100"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.85rem' }}>
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
