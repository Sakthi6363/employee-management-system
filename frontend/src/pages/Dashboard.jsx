import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ─── tiny helpers ─────────────────────────────────────────── */
const fmt = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ─── stat card ─────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, bg, sub }) => (
  <div className="stat-card h-100">
    <div className="d-flex align-items-start justify-content-between mb-3">
      <div className="stat-icon" style={{ background: bg }}>
        <i className={`bi ${icon}`} style={{ color }}></i>
      </div>
      {sub && (
        <span style={{ fontSize: '0.72rem', background: bg, color, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
          {sub}
        </span>
      )}
    </div>
    <div className="stat-value">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
);

/* ─── mini bar chart (pure CSS) ─────────────────────────────── */
const MiniBarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = Math.round((d.count / max) * 100);
        const isToday = i === data.length - 1;
        return (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            title={`${d.date}: ${d.count} login${d.count !== 1 ? 's' : ''}`}>
            <div style={{
              width: '100%', height: `${Math.max(pct, 4)}%`,
              background: isToday ? '#4f46e5' : '#c4b5fd',
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.4s ease',
              minHeight: 3
            }} />
          </div>
        );
      })}
    </div>
  );
};

/* ─── main component ─────────────────────────────────────────── */
const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [chart,   setChart]   = useState([]);
  const [histPag, setHistPag] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  /* fetch stats + chart once */
  useEffect(() => {
    const init = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/dashboard/login-chart')
        ]);
        setStats(sRes.data);
        setChart(cRes.data.chart);
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* fetch login history (paginated) */
  const fetchHistory = async (page = 1) => {
    try {
      const res = await API.get(`/dashboard/login-history?page=${page}&limit=8`);
      setHistory(res.data.history);
      setHistPag(res.data.pagination);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div>
      {/* ── Welcome banner ── */}
      <div className="p-4 mb-4 rounded-3" style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white'
      }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 className="mb-1 fw-bold">Welcome back, {user?.name}! 👋</h4>
            <p className="mb-0 opacity-75" style={{ fontSize: '0.9rem' }}>
              {isAdmin()
                ? 'Full admin access — manage employees, users, and monitor activity.'
                : 'You can view employee records and your login history.'}
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {isAdmin() && (
              <Link to="/employees" className="btn btn-light btn-sm px-4 fw-semibold" style={{ borderRadius: 8 }}>
                <i className="bi bi-plus-lg me-1"></i> Add Employee
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 1: Employee stats ── */}
      <p className="text-muted fw-semibold mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <i className="bi bi-people-fill me-1"></i> Employee Overview
      </p>
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-people-fill"     label="Total Employees"    value={s.employees?.total}      color="#4f46e5" bg="#ede9fe" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-person-check-fill" label="Active Employees"  value={s.employees?.active}     color="#10b981" bg="#dcfce7" sub="Active" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-person-x-fill"   label="Inactive Employees" value={s.employees?.inactive}   color="#ef4444" bg="#fee2e2" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-building"        label="Departments"        value={s.employees?.departments?.length} color="#f59e0b" bg="#fef3c7" />
        </div>
      </div>

      {/* ── Row 2: User + Login stats ── */}
      <p className="text-muted fw-semibold mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <i className="bi bi-shield-person-fill me-1"></i> User & Login Activity
      </p>
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-person-badge-fill" label="Total Users"       value={s.users?.total}          color="#3b82f6" bg="#dbeafe" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-shield-fill-check" label="Administrators"    value={s.users?.admins}         color="#7c3aed" bg="#ede9fe" sub="Admin" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-box-arrow-in-right" label="Logins Today"     value={s.logins?.today}         color="#10b981" bg="#dcfce7" sub="Today" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-calendar-week-fill" label="Logins This Week" value={s.logins?.thisWeek}      color="#f59e0b" bg="#fef3c7" sub="7 days" />
        </div>
      </div>

      {/* ── Row 3: Chart + Login history ── */}
      <div className="row g-3 mb-4">

        {/* Login activity chart */}
        <div className="col-lg-4">
          <div className="table-card h-100">
            <div className="table-header">
              <h6 className="table-title mb-0">
                <i className="bi bi-bar-chart-fill me-2 text-muted"></i>
                Login Activity
              </h6>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last 14 days</span>
            </div>
            <div className="p-3">
              <MiniBarChart data={chart} />
              <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>{chart[0]?.date ? new Date(chart[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                <span>Today</span>
              </div>
              <hr className="my-3" />
              <div className="row text-center g-2">
                <div className="col-4">
                  <div className="fw-bold" style={{ color: '#4f46e5', fontSize: '1.2rem' }}>{s.logins?.today ?? 0}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Today</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold" style={{ color: '#7c3aed', fontSize: '1.2rem' }}>{s.logins?.thisWeek ?? 0}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>This Week</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold" style={{ color: '#3b82f6', fontSize: '1.2rem' }}>{s.logins?.thisMonth ?? 0}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User breakdown */}
        <div className="col-lg-4">
          <div className="table-card h-100">
            <div className="table-header">
              <h6 className="table-title mb-0">
                <i className="bi bi-pie-chart-fill me-2 text-muted"></i>
                User Breakdown
              </h6>
            </div>
            <div className="p-3">
              {/* Visual ratio bar */}
              {(s.users?.total ?? 0) > 0 && (
                <div className="mb-3">
                  <div style={{ height: 10, borderRadius: 8, background: '#f1f5f9', overflow: 'hidden', display: 'flex' }}>
                    <div style={{
                      width: `${Math.round((s.users.admins / s.users.total) * 100)}%`,
                      background: 'linear-gradient(90deg,#7c3aed,#4f46e5)',
                      transition: 'width 0.6s ease'
                    }} />
                    <div style={{
                      flex: 1,
                      background: 'linear-gradient(90deg,#3b82f6,#06b6d4)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                  <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>Admins {Math.round((s.users.admins / s.users.total) * 100)}%</span>
                    <span>Users {Math.round((s.users.regular / s.users.total) * 100)}%</span>
                  </div>
                </div>
              )}
              <div className="d-flex flex-column gap-2 mt-3">
                {[
                  { label: 'Total Registered Users', val: s.users?.total,   color: '#4f46e5', icon: 'bi-people-fill' },
                  { label: 'Administrators',          val: s.users?.admins,  color: '#7c3aed', icon: 'bi-shield-fill-check' },
                  { label: 'Regular Users',           val: s.users?.regular, color: '#3b82f6', icon: 'bi-person-fill' },
                ].map(row => (
                  <div key={row.label} className="d-flex align-items-center justify-content-between p-2 rounded"
                    style={{ background: '#f8fafc' }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${row.icon}`} style={{ color: row.color, fontSize: '1rem' }}></i>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{row.label}</span>
                    </div>
                    <span className="fw-bold" style={{ color: row.color, fontSize: '1rem' }}>{row.val ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="col-lg-4">
          <div className="table-card h-100">
            <div className="table-header">
              <h6 className="table-title mb-0">
                <i className="bi bi-building me-2 text-muted"></i>
                Departments
              </h6>
              <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.72rem', padding: '4px 10px', borderRadius: 20 }}>
                {s.employees?.departments?.length ?? 0} total
              </span>
            </div>
            <div className="p-3">
              {(s.employees?.departments?.length ?? 0) === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <i className="bi bi-building" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0" style={{ fontSize: '0.85rem' }}>No departments yet</p>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {s.employees.departments.map(dept => (
                    <span key={dept} style={{
                      background: '#f1f5f9', color: '#475569',
                      padding: '5px 12px', borderRadius: 20,
                      fontSize: '0.8rem', fontWeight: 500,
                      border: '1px solid #e2e8f0'
                    }}>
                      <i className="bi bi-building me-1" style={{ fontSize: '0.7rem' }}></i>
                      {dept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Login History table ── */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <h6 className="table-title mb-1">
              <i className="bi bi-clock-history me-2 text-muted"></i>
              {isAdmin() ? 'All Users Login History' : 'My Login History'}
            </h6>
            <small className="text-muted">{histPag.total} total login records</small>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-clock-history"></i>
            <p>No login history yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  {isAdmin() && <th>User</th>}
                  {isAdmin() && <th>Role</th>}
                  <th>Login Time</th>
                  <th>Time Ago</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={h.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {(histPag.page - 1) * histPag.limit + idx + 1}
                    </td>
                    {isAdmin() && (
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: h.user_role === 'admin'
                              ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                              : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                          }}>
                            {h.user_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{h.user_name}</div>
                            <div className="text-muted" style={{ fontSize: '0.73rem' }}>{h.user_email}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {isAdmin() && (
                      <td>
                        <span className={h.user_role === 'admin' ? 'badge-admin' : 'badge-user'}>
                          {h.user_role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                    )}
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      <i className="bi bi-calendar3 me-1 text-muted"></i>
                      {fmt(h.login_at)}
                    </td>
                    <td>
                      <span style={{
                        background: '#f1f5f9', color: '#64748b',
                        padding: '3px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500
                      }}>
                        <i className="bi bi-clock me-1"></i>{timeAgo(h.login_at)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>
                        <i className="bi bi-hdd-network me-1 text-muted"></i>
                        {h.ip_address || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {histPag.totalPages > 1 && (
          <div className="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <small className="text-muted">
              Showing {(histPag.page - 1) * histPag.limit + 1}–{Math.min(histPag.page * histPag.limit, histPag.total)} of {histPag.total}
            </small>
            <nav>
              <ul className="pagination pagination-custom mb-0">
                <li className={`page-item ${histPag.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchHistory(histPag.page - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: histPag.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - histPag.page) <= 2)
                  .map(p => (
                    <li key={p} className={`page-item ${p === histPag.page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => fetchHistory(p)}>{p}</button>
                    </li>
                  ))}
                <li className={`page-item ${histPag.page === histPag.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchHistory(histPag.page + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
