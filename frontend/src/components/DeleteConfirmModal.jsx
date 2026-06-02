import React from 'react';

const DeleteConfirmModal = ({ name, onConfirm, onCancel }) => {
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
        <div className="modal-content" style={{ borderRadius: 12, border: 'none' }}>
          <div className="modal-body p-4 text-center">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <i className="bi bi-trash-fill" style={{ fontSize: '1.6rem', color: '#dc2626' }}></i>
            </div>
            <h5 className="fw-bold mb-2">Delete Employee</h5>
            <p className="text-muted mb-0">
              Are you sure you want to delete <strong>{name}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer justify-content-center border-0 pt-0 pb-4 gap-2">
            <button
              type="button"
              className="btn btn-sm px-4"
              style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 8, minWidth: 100 }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm px-4"
              style={{ background: '#dc2626', color: 'white', borderRadius: 8, minWidth: 100 }}
              onClick={onConfirm}
            >
              <i className="bi bi-trash-fill me-1"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
