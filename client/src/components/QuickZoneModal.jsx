import React, { useState } from 'react';
import api from '../api/client';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const QuickZoneModal = ({
  isOpen,
  onClose,
  localidadId,
  localidadNombre,
  onCreated
}) => {
  const [nombre, setNombre] = useState('');
  const [diasDeReparto, setDiasDeReparto] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setNombre('');
    setDiasDeReparto([]);
    setError('');
    setFieldErrors({});
    onClose();
  };

  const toggleDay = (day) => {
    setDiasDeReparto((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!nombre.trim()) {
      setFieldErrors({ nombre: 'El nombre de la zona es obligatorio' });
      return;
    }

    if (!localidadId) {
      setError('Debe seleccionar primero una localidad');
      return;
    }

    setLoading(true);
    try {
      const created = await api.post('/zones', {
        nombre: nombre.trim(),
        localidad: localidadId,
        diasDeReparto
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
      } else if (err.message && err.message.toLowerCase().includes('nombre')) {
        setFieldErrors({ nombre: err.message });
        setError(err.message);
      } else {
        setError(err.message || 'Error al crear la zona');
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
          maxWidth: '500px',
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="modal-header" style={{ borderRadius: 0 }}>
          <h3 className="modal-title">+ Nueva Zona</h3>
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
              <label className="form-label">Localidad de pertenencia</label>
              <input
                type="text"
                className="form-control"
                style={{ borderRadius: 0, backgroundColor: 'var(--bg-main)' }}
                value={localidadNombre || 'Localidad seleccionada'}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quick-zone-nombre">
                Nombre de la Zona *
              </label>
              <input
                id="quick-zone-nombre"
                type="text"
                className={`form-control ${fieldErrors.nombre ? 'input-error' : ''}`}
                style={{ borderRadius: 0 }}
                placeholder="Ej: Zona Centro, Zona Norte..."
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
              <label className="form-label">Días de Reparto (Lunes a Sábado)</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {DIAS_SEMANA.map((day) => (
                  <label
                    key={day}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.35rem 0.6rem',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      backgroundColor: diasDeReparto.includes(day)
                        ? 'var(--primary-light)'
                        : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={diasDeReparto.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
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
              {loading ? 'Guardando...' : 'Guardar Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickZoneModal;
