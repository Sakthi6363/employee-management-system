import React, { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';

const ACTION_COLORS = {
  CREATE_EMPLOYEE: { bg: '#dcfce7', color: '#166534', icon: 'bi-person-plus-fill' },
  UPDATE_EMPLOYEE: { bg: '#dbeafe', color: '#1e40af', icon: 'bi-pencil-fill' },
  DELETE_EMPLOYEE: { bg: '#fee2e2', color: '#991b1b', icon: 'bi-trash-fill' },
  UPDATE_USER_ROLE:{ bg: '#fef3c7', color: '#92400e', icon: 'bi-arrow-repeat' },
  DELETE_USER:     { bg: '#fee2e2', color: '#991b1b', icon: 'bi-person-x-fill' },
  CREATE_ADMIN:    { bg: '#ede9fe', color: '#5b21b6', icon: 'bi-shield-plus' },
};

const fmt = (ts) => new Date(ts).toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true
});

const AuditLogs = () => {
  const [logs, setLogs]   = useState([]);
  const [pag, setPag]     = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/dashboard/audit-logs?page=${page}&limit=15`);
      setLogs(res.data.logs);
      setPag(res.data.pagination);
    } catch (err) {
      console.error('Audit logs error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1); }, []);

  return (
    <div>
      <div className="table-card">
        <div className="table-header">
          <div>
            <h6 className="table-title mb-1">
              <i className="bi bi-journal-text me-2 text-muted"></i>
              Admin Audit Logs
            </h6>
            <small className="text-muted">{pag.total} total actions recorded</small>
          </div>
          <button className="btn btn-sm" style={{ background: '#f1f5f9', color: '#475569', borderRadius: 8, fontSize: '0.82rem' }}
            onClick={() => fetchLogs(pag.page)}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className="spinner-overlay">
            <div className="spinner-border" style={{ color: '#4f46e5' }}></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-journal-text"></i>
            <p>No audit logs yet. Admin actions will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const style = ACTION_COLORS[log.action] || { bg: '#f1f5f9', color: '#475569', icon: 'bi-activity' };
                  return (
                    <tr key={log.id}>
                      <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {(pag.page - 1) * pag.limit + idx + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                            {log.admin_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{log.admin_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          <i className={`bi ${style.icon} me-1`}></i>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {log.target_type && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {log.target_type} #{log.target_id}
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }} title={log.details}>
                          {log.details ? (log.details.length > 60 ? log.details.slice(0, 60) + '…' : log.details) : '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                          {log.ip_address || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: '#475569' }}>
                        {fmt(log.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pag.totalPages > 1 && (
          <div className="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
            <small className="text-muted">
              Showing {(pag.page - 1) * pag.limit + 1}–{Math.min(pag.page * pag.limit, pag.total)} of {pag.total}
            </small>
            <nav>
              <ul className="pagination pagination-custom mb-0">
                <li className={`page-item ${pag.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchLogs(pag.page - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: pag.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - pag.page) <= 2)
                  .map(p => (
                    <li key={p} className={`page-item ${p === pag.page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => fetchLogs(p)}>{p}</button>
                    </li>
                  ))}
                <li className={`page-item ${pag.page === pag.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => fetchLogs(pag.page + 1)}>
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

export default AuditLogs;
