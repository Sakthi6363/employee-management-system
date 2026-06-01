import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mode, setMode]   = useState('user');   // 'user' | 'admin'
  const [form, setForm]   = useState({ admin_id: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'admin') {
      if (!form.admin_id || !form.email || !form.password) {
        setError('Admin ID, email, and password are required.');
        return;
      }
    } else {
      if (!form.email || !form.password) {
        setError('Email and password are required.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'admin') {
        await adminLogin(form.admin_id, form.email, form.password);
      } else {
        const u = await login(form.email, form.password);
        // Block admins from using the user login tab
        if (u.role === 'admin') {
          setError('Admin accounts must use the Admin Login tab.');
          setLoading(false);
          return;
        }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { borderLeft: 'none' };
  const prefixStyle = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRight: 'none' };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="auth-logo">
          <i className={`bi ${mode === 'admin' ? 'bi-shield-lock-fill' : 'bi-people-fill'}`}></i>
        </div>
        <h2 className="auth-title">{mode === 'admin' ? 'Admin Login' : 'Welcome Back'}</h2>
        <p className="auth-subtitle">
          {mode === 'admin' ? 'Secure admin access portal' : 'Sign in to your account'}
        </p>

        {/* Tab switcher */}
        <div className="d-flex mb-4 rounded-2 overflow-hidden" style={{ border: '1.5px solid #e2e8f0' }}>
          {['user', 'admin'].map(m => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setError(''); setForm({ admin_id: '', email: '', password: '' }); }}
              className="flex-fill py-2 border-0 fw-semibold"
              style={{
                fontSize: '0.85rem',
                background: mode === m ? (m === 'admin' ? '#4f46e5' : '#4f46e5') : '#f8fafc',
                color: mode === m ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}>
              <i className={`bi ${m === 'admin' ? 'bi-shield-fill-check' : 'bi-person-fill'} me-1`}></i>
              {m === 'admin' ? 'Admin Login' : 'User Login'}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-danger alert-custom d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Admin ID — only shown in admin mode */}
          {mode === 'admin' && (
            <div className="mb-3">
              <label className="form-label-custom">
                Admin ID <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text" style={prefixStyle}>
                  <i className="bi bi-person-badge text-muted"></i>
                </span>
                <input type="text" name="admin_id"
                  className="form-control form-control-custom" style={inputStyle}
                  placeholder="e.g. ADMIN001"
                  value={form.admin_id} onChange={handleChange}
                  autoComplete="off" />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label-custom">Email Address <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}>
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input type="email" name="email"
                className="form-control form-control-custom" style={inputStyle}
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Password <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}>
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input type="password" name="password"
                className="form-control form-control-custom" style={inputStyle}
                placeholder="Enter your password"
                value={form.password} onChange={handleChange}
                autoComplete="current-password" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</>
            ) : (
              <><i className={`bi ${mode === 'admin' ? 'bi-shield-lock-fill' : 'bi-box-arrow-in-right'} me-2`}></i>
                {mode === 'admin' ? 'Admin Sign In' : 'Sign In'}</>
            )}
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        {/* Demo hint */}
        <div className="mt-3 p-3 rounded-2" style={{ background: '#f8fafc', fontSize: '0.78rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
          <div className="fw-semibold mb-1" style={{ color: '#475569' }}>
            <i className="bi bi-info-circle me-1"></i> Default Admin Credentials
          </div>
          Admin ID: <strong>ADMIN001</strong> &nbsp;|&nbsp;
          Email: <strong>admin@workflow.com</strong> &nbsp;|&nbsp;
          Password: <strong>Admin@123</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;
