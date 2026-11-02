import React, { useEffect } from 'react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirmar acción',
  message = '¿Está seguro de que desea continuar?',
  confirmText = 'Sí, borrar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  isDanger = true,
  error = '',
  errorStatus = null
}) => {
  // Manejo de cierre mediante tecla Escape (solo si no hay una accion en curso)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  // Es un error por regla de negocio de la API (HTTP 400)
  const isBusinessRuleError = Boolean(error && errorStatus === 400);

  const handleOverlayClick = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
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
          {error && (
            <div className="alert alert-danger" style={{ marginTop: '0.75rem' }}>
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isBusinessRuleError ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onCancel}
              autoFocus
            >
              Entendido
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
