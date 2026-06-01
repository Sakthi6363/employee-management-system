import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prefixStyle = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRight: 'none' };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo"><i className="bi bi-person-plus-fill"></i></div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register as a regular user</p>

        {/* Info banner */}
        <div className="alert mb-3 d-flex align-items-start gap-2"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: '0.82rem', color: '#1e40af' }}>
          <i className="bi bi-info-circle-fill mt-1" style={{ flexShrink: 0 }}></i>
          <span>
            Public registration creates a <strong>User</strong> account.
            Admin accounts are created by existing admins only.
          </span>
        </div>

        {error && (
          <div className="alert alert-danger alert-custom d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Full Name</label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}><i className="bi bi-person text-muted"></i></span>
              <input type="text" name="name" className="form-control form-control-custom" style={{ borderLeft: 'none' }}
                placeholder="John Doe" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label-custom">Email Address</label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}><i className="bi bi-envelope text-muted"></i></span>
              <input type="email" name="email" className="form-control form-control-custom" style={{ borderLeft: 'none' }}
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label-custom">Password</label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}><i className="bi bi-lock text-muted"></i></span>
              <input type="password" name="password" className="form-control form-control-custom" style={{ borderLeft: 'none' }}
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text" style={prefixStyle}><i className="bi bi-lock-fill text-muted"></i></span>
              <input type="password" name="confirmPassword" className="form-control form-control-custom" style={{ borderLeft: 'none' }}
                placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account…</>
              : <><i className="bi bi-person-check-fill me-2"></i>Create Account</>}
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
