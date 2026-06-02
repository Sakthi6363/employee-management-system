import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard':  'Dashboard',
  '/employees':  'Employees',
  '/users':      'User Management',
  '/audit-logs': 'Audit Logs'
};

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Employee Management';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="d-flex align-items-center gap-2">
            {user?.must_change_password && (
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', padding: '5px 10px', borderRadius: 20 }}>
                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                Change password required
              </span>
            )}
            <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.72rem', padding: '5px 12px', borderRadius: 20 }}>
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.45rem', color: '#10b981' }}></i>
              System Online
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
