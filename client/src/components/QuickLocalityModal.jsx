import React, { useState } from 'react';
import api from '../api/client';

const QuickLocalityModal = ({ isOpen, onClose, onCreated }) => {
  const [nombre, setNombre] = useState('');
  const [provincia, setProvincia] = useState('Santa Fe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setNombre('');
    setProvincia('Santa Fe');
    setError('');
    setFieldErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!nombre.trim()) {
      setFieldErrors({ nombre: 'El nombre de la localidad es obligatorio' });
      return;
    }

    setLoading(true);
    try {
      const created = await api.post('/localities', {
        nombre: nombre.trim(),
        provincia: provincia.trim() || 'Santa Fe'
      });

      if (onCreated) {
        onCreated(created);
      }
      handleClose();
    } catch (err) {
      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const apiErrors = {};
        err.detalles.forEach((d) => {
          if (d.campo) apiErrors[d.campo] = d.mensaje;
        });
        setFieldErrors(apiErrors);
        setError('Por favor, corregí los errores indicados abajo');
      } else {
        setError(err.message || 'Error al crear la localidad');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="modal-header" style={{ borderRadius: 0 }}>
          <h3 className="modal-title">+ Nueva Localidad</h3>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', borderRadius: 0 }}>
                <span>⚠️</span>
                <div>{error}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="quick-loc-nombre">
                Nombre de la Localidad *
              </label>
              <input
                id="quick-loc-nombre"
                type="text"
                className={`form-control ${fieldErrors.nombre ? 'input-error' : ''}`}
                style={{ borderRadius: 0 }}
                placeholder="Ej: Santa Fe Capital, Santo Tomé..."
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (fieldErrors.nombre) {
                    setFieldErrors((prev) => ({ ...prev, nombre: '' }));
                  }
                }}
                autoFocus
              />
              {fieldErrors.nombre && (
                <span className="field-error">{fieldErrors.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quick-loc-provincia">
                Provincia
              </label>
              <input
                id="quick-loc-provincia"
                type="text"
                className="form-control"
                style={{ borderRadius: 0 }}
                placeholder="Santa Fe"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ borderRadius: 0 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ borderRadius: 0 }}
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 0 }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Localidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickLocalityModal;
