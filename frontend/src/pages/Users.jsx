import React, { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateAdminModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', admin_id: '' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.admin_id) {
      setError('All fields are required.'); return;
    }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await API.post('/users/create-admin', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin.');
    } finally { setSaving(false); }
  };

  const ps = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRight: 'none' };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
        <div className="modal-content" style={{ borderRadius: 12, border: 'none' }}>
          <div className="modal-header modal-header-custom">
            <h5 className="modal-title"><i className="bi bi-shield-plus me-2"></i>Create Admin User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger alert-custom d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i> {error}
                </div>
              )}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label-custom">Admin ID <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text" style={ps}><i className="bi bi-person-badge text-muted"></i></span>
                    <input type="text" name="admin_id" className="form-control form-control-custom" style={{ borderLeft: 'none' }}
                      placeholder="e.g. ADMIN002" value={form.admin_id} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Full Name <span className="text-danger">*</span></label>
                  <input type="text" name="name" className="form-control form-control-custom"
                    placeholder="Jane Smith" value={form.name} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Email Address <span className="text-danger">*</span></label>
                  <input type="email" name="email" className="form-control form-control-custom"
                    placeholder="admin@company.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Password <span className="text-danger">*</span></label>
                  <input type="password" name="password" className="form-control form-control-custom"
                    placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                  <small className="text-muted">User will be prompted to change password on first login.</small>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '14px 24px' }}>
              <button type="button" className="btn btn-sm px-4" style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 8 }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary-custom btn-sm px-4" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating…</> : <><i className="bi bi-shield-plus me-1"></i>Create Admin</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]     = useState([]);
  const [pag, setPag]         = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/users?page=${page}&limit=${pag.limit}`);
      setUsers(res.data.users);
      setPag(res.data.pagination);
    } catch { showAlert('danger', 'Failed to load users.'); }
    finally { setLoading(false); }
  }, [pag.limit]);

  useEffect(() => { fetchUsers(1); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      showAlert('success', 'User role updated.');
      fetchUsers(pag.page);
    } catch (err) { showAlert('danger', err.response?.data?.message || 'Failed to update role.'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/users/${userId}`);
      showAlert('success', 'User deleted.');
      fetchUsers(pag.page);
    } catch (err) { showAlert('danger', err.response?.data?.message || 'Failed to delete user.'); }
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type} alert-custom d-flex align-items-center gap-2 mb-4`}>
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          {alert.message}
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h6 className="table-title mb-1">
              <i className="bi bi-shield-person-fill me-2 text-muted"></i>User Management
            </h6>
            <small className="text-muted">{pag.total} registered users</small>
          </div>
          <button className="btn btn-primary-custom btn-sm" onClick={() => setShowCreate(true)}>
            <i className="bi bi-shield-plus me-1"></i> Create Admin
          </button>
        </div>

        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner-border" style={{ color: '#4f46e5' }}></div>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state"><i className="bi bi-people"></i><p>No users found.</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>#</th><th>User</th><th>Email</th><th>Admin ID</th>
                  <th>Role</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {(pag.page - 1) * pag.limit + idx + 1}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ms-1" style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', padding: '1px 7px', borderRadius: 20 }}>You</span>
                            )}
                          </div>
                          {u.must_change_password ? (
                            <span style={{ fontSize: '0.68rem', color: '#d97706' }}>
                              <i className="bi bi-exclamation-triangle-fill me-1"></i>Must change password
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      {u.admin_id
                        ? <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#ede9fe', color: '#5b21b6', padding: '3px 8px', borderRadius: 6 }}>{u.admin_id}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      {u.id !== currentUser?.id ? (
                        <div className="d-flex gap-1 align-items-center">
                          <select className="form-select form-select-sm"
                            style={{ width: 'auto', borderRadius: 8, fontSize: '0.8rem', border: '1.5px solid #e2e8f0' }}
                            value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(u.id)} title="Delete">
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pag.totalPages > 1 && (
          <div className="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <small className="text-muted">
              Showing {(pag.page - 1) * pag.limit + 1}–{Math.min(pag.page * pag.limit, pag.total)} of {pag.total}
            </small>
            <nav>
              <ul className="pagination pagination-custom mb-0">
                <li className={`page-item ${pag.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchUsers(pag.page - 1)}><i className="bi bi-chevron-left"></i></button>
                </li>
                {Array.from({ length: pag.totalPages }, (_, i) => i + 1).map(p => (
                  <li key={p} className={`page-item ${p === pag.page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchUsers(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${pag.page === pag.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchUsers(pag.page + 1)}><i className="bi bi-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); showAlert('success', 'Admin user created successfully.'); fetchUsers(1); }}
        />
      )}
    </div>
  );
};

export default Users;
