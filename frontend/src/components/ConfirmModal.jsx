import React from 'react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirmar acción',
  message = '¿Está seguro de que desea continuar?',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.975rem', color: 'var(--text-main)' }}>{message}</p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
