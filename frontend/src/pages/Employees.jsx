import React, { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EmployeeModal from '../components/EmployeeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];

const Employees = () => {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchEmployees = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(filterDept && { department: filterDept }),
        ...(filterStatus && { status: filterStatus })
      });
      const res = await API.get(`/employees?${params}`);
      setEmployees(res.data.employees);
      setPagination(res.data.pagination);
    } catch (err) {
      showAlert('danger', 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [search, filterDept, filterStatus, pagination.limit]);

  useEffect(() => {
    fetchEmployees(1);
  }, [search, filterDept, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const handlePageChange = (page) => {
    fetchEmployees(page);
  };

  const handleAdd = () => {
    setEditEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (emp) => {
    setEditEmployee(emp);
    setShowModal(true);
  };

  const handleDelete = (emp) => {
    setDeleteTarget(emp);
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) {
        await API.put(`/employees/${id}`, formData);
        showAlert('success', 'Employee updated successfully.');
      } else {
        await API.post('/employees', formData);
        showAlert('success', 'Employee created successfully.');
      }
      setShowModal(false);
      fetchEmployees(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Operation failed.';
      throw new Error(msg);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/employees/${deleteTarget.id}`);
      showAlert('success', 'Employee deleted successfully.');
      setDeleteTarget(null);
      fetchEmployees(pagination.page);
    } catch (err) {
      showAlert('danger', 'Failed to delete employee.');
      setDeleteTarget(null);
    }
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <nav>
        <ul className="pagination pagination-custom mb-0">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page - 1)}>
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          {start > 1 && (
            <>
              <li className="page-item"><button className="page-link" onClick={() => handlePageChange(1)}>1</button></li>
              {start > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
            </>
          )}
          {pages.map(p => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(p)}>{p}</button>
            </li>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <li className="page-item disabled"><span className="page-link">…</span></li>}
              <li className="page-item"><button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button></li>
            </>
          )}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(page + 1)}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type} alert-custom d-flex align-items-center gap-2 mb-4`} role="alert">
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          {alert.message}
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h6 className="table-title mb-1">
              <i className="bi bi-people-fill me-2 text-muted"></i>
              Employee Directory
            </h6>
            <small className="text-muted">{pagination.total} total employees</small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {isAdmin() && (
              <button className="btn btn-primary-custom btn-sm" onClick={handleAdd}>
                <i className="bi bi-plus-lg me-1"></i> Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-bottom" style={{ background: '#fafafa' }}>
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <form onSubmit={handleSearch}>
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    placeholder="Search by name, email, position..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-control-custom"
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-control-custom"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="button" className="btn btn-primary-custom btn-sm flex-fill" onClick={handleSearch}>
                <i className="bi bi-search me-1"></i> Search
              </button>
              {(search || filterDept || filterStatus) && (
                <button type="button" className="btn btn-sm flex-fill" style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 8 }}
                  onClick={() => { handleClearSearch(); setFilterDept(''); setFilterStatus(''); }}>
                  <i className="bi bi-x-lg me-1"></i> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner-border" style={{ color: '#4f46e5' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people"></i>
            <p className="fw-semibold">No employees found</p>
            <p className="text-muted small">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  {isAdmin() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `hsl(${(emp.id * 47) % 360}, 60%, 55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                        }}>
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>ID: {emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{emp.email}</div>
                      {emp.phone && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{emp.phone}</div>}
                    </td>
                    <td>{emp.department || <span className="text-muted">—</span>}</td>
                    <td>{emp.position || <span className="text-muted">—</span>}</td>
                    <td>
                      {emp.salary
                        ? <span className="fw-semibold">${Number(emp.salary).toLocaleString()}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {emp.hire_date
                        ? new Date(emp.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={emp.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                        {emp.status}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn-icon btn-edit" onClick={() => handleEdit(emp)} title="Edit">
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(emp)} title="Delete">
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && employees.length > 0 && (
          <div className="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <small className="text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
            </small>
            {renderPagination()}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={editEmployee}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          name={`${deleteTarget.first_name} ${deleteTarget.last_name}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Employees;
