import React, { useState, useEffect } from 'react';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];

const defaultForm = {
  first_name: '', last_name: '', email: '', phone: '',
  department: '', position: '', salary: '', hire_date: '', status: 'active'
};

const EmployeeModal = ({ employee, onSave, onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary || '',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        status: employee.status || 'active'
      });
    } else {
      setForm(defaultForm);
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) {
      setError('First name, last name, and email are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form, employee?.id);
    } catch (err) {
      setError(err.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content" style={{ borderRadius: 12, border: 'none' }}>
          <div className="modal-header modal-header-custom">
            <h5 className="modal-title">
              <i className={`bi ${employee ? 'bi-pencil-fill' : 'bi-person-plus-fill'} me-2`}></i>
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert alert-danger alert-custom d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label-custom">First Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control form-control-custom"
                    placeholder="John"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Last Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control form-control-custom"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Email Address <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-custom"
                    placeholder="john.doe@company.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control form-control-custom"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Department</label>
                  <select
                    name="department"
                    className="form-select form-control-custom"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Position / Title</label>
                  <input
                    type="text"
                    name="position"
                    className="form-control form-control-custom"
                    placeholder="Software Engineer"
                    value={form.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Salary (USD)</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRight: 'none', fontSize: '0.9rem' }}>$</span>
                    <input
                      type="number"
                      name="salary"
                      className="form-control form-control-custom"
                      style={{ borderLeft: 'none' }}
                      placeholder="75000"
                      min="0"
                      step="0.01"
                      value={form.salary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Hire Date</label>
                  <input
                    type="date"
                    name="hire_date"
                    className="form-control form-control-custom"
                    value={form.hire_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Status</label>
                  <select
                    name="status"
                    className="form-select form-control-custom"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
              <button type="button" className="btn btn-sm px-4" style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 8 }} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary-custom btn-sm px-4" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className={`bi ${employee ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                    {employee ? 'Update Employee' : 'Create Employee'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
