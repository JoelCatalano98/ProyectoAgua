import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import ConfirmModal from './ConfirmModal';

const EntityCrud = ({
  title,
  subtitle,
  endpoint,
  columns = [],
  fields = [],
  filters = [],
  initialFormValues = {},
  onTransformSubmit,
  onTransformInitial,
  extraRowActions,
  headerActions
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Estados de filtros
  const [filterValues, setFilterValues] = useState(() => {
    const initial = {};
    filters.forEach((f) => {
      initial[f.name] = f.defaultValue || '';
    });
    return initial;
  });

  // Estados de modal formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormValues);
  const [formError, setFormError] = useState('');

  // Estados de modal confirmacion de eliminacion
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Carga de datos
  const loadItems = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await api.get(endpoint, filterValues);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [endpoint, filterValues]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Manejo de cambios en filtros
  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir modal de creacion
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialFormValues);
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal de edicion
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const initial = onTransformInitial ? onTransformInitial(item) : { ...item };
    setFormData(initial);
    setFormError('');
    setIsModalOpen(true);
  };

  // Abrir modal de eliminacion
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setApiError('');
    setApiSuccess('');
    setIsDeleteModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    try {
      const payload = onTransformSubmit ? onTransformSubmit(formData) : formData;

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem._id}`, payload);
        setApiSuccess(`${title} actualizado correctamente`);
      } else {
        await api.post(endpoint, payload);
        setApiSuccess(`${title} creado exitosamente`);
      }

      setIsModalOpen(false);
      loadItems();
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Error al procesar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmar eliminacion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    setApiError('');

    try {
      await api.delete(`${endpoint}/${itemToDelete._id}`);
      setApiSuccess('Registro eliminado correctamente');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadItems();
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      // Muestra claramente mensajes como 400 de reglas de negocio
      setApiError(err.message || 'Error al eliminar el registro');
      setIsDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Manejo de campos en formulario dinamico
  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">{title}</h2>
            {subtitle && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {headerActions}
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              ➕ Nuevo
            </button>
          </div>
        </div>

        {/* Mensajes de exito o error globales */}
        {apiSuccess && (
          <div className="alert alert-success">
            <span>✅</span>
            <div>{apiSuccess}</div>
          </div>
        )}
        {apiError && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <div>{apiError}</div>
          </div>
        )}

        {/* Barra de filtros */}
        {filters.length > 0 && (
          <div className="filters-bar">
            {filters.map((filter) => (
              <div key={filter.name} className="form-group">
                <label className="form-label">{filter.label}</label>
                <select
                  className="form-control"
                  value={filterValues[filter.name] || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                >
                  <option value="">{filter.placeholder || 'Todos'}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div style={{ alignSelf: 'flex-end', paddingBottom: '2px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const reset = {};
                  filters.forEach((f) => {
                    reset[f.name] = '';
                  });
                  setFilterValues(reset);
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Tabla responsive con transformacion a tarjetas en celular */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            Cargando registros...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No se encontraron registros.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((col) => (
                      <td key={col.key} data-label={col.label}>
                        {col.render ? col.render(item) : item[col.key] || '-'}
                      </td>
                    ))}
                    <td data-label="Acciones">
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        {extraRowActions && extraRowActions(item)}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(item)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleOpenDelete(item)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creacion / Edicion */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !actionLoading && setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? `Editar ${title}` : `Nuevo ${title}`}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger">
                    <span>⚠️</span>
                    <div>{formError}</div>
                  </div>
                )}

                {fields.map((field) => {
                  if (field.type === 'checkbox') {
                    return (
                      <div key={field.name} className="form-group checkbox-group">
                        <input
                          id={field.name}
                          type="checkbox"
                          checked={Boolean(formData[field.name])}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        />
                        <label className="form-label" htmlFor={field.name} style={{ cursor: 'pointer' }}>
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.name} className="form-group">
                        <label className="form-label" htmlFor={field.name}>
                          {field.label} {field.required && '*'}
                        </label>
                        <select
                          id={field.name}
                          className="form-control"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                        >
                          <option value="">{field.placeholder || 'Seleccione una opción...'}</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name} className="form-group">
                        <label className="form-label" htmlFor={field.name}>
                          {field.label} {field.required && '*'}
                        </label>
                        <textarea
                          id={field.name}
                          className="form-control"
                          rows="3"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'days') {
                    const daysList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];

                    return (
                      <div key={field.name} className="form-group">
                        <label className="form-label">{field.label}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                          {daysList.map((day) => (
                            <label
                              key={day}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                              <input
                                type="checkbox"
                                checked={currentDays.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleFieldChange(field.name, [...currentDays, day]);
                                  } else {
                                    handleFieldChange(
                                      field.name,
                                      currentDays.filter((d) => d !== day)
                                    );
                                  }
                                }}
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field.name} className="form-group">
                      <label className="form-label" htmlFor={field.name}>
                        {field.label} {field.required && '*'}
                      </label>
                      <input
                        id={field.name}
                        type={field.type || 'text'}
                        step={field.step}
                        min={field.min}
                        className="form-control"
                        placeholder={field.placeholder}
                        value={formData[field.name] !== undefined ? formData[field.name] : ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmacion para eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Eliminar ${title}`}
        message={`¿Está seguro de que desea eliminar ${
          itemToDelete ? `"${itemToDelete.nombre || 'este registro'}"` : 'este registro'
        }? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default EntityCrud;
