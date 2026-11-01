import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { useCrud } from '../hooks/useCrud';
import { useModal } from '../hooks/useModal';
import { useForm } from '../hooks/useForm';
import { useTimedMessage } from '../hooks/useTimedMessage';

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
  // Filtros
  const [filterValues, setFilterValues] = useState(() => {
    const initial = {};
    filters.forEach((f) => {
      initial[f.name] = f.defaultValue || '';
    });
    return initial;
  });

  // Mensaje temporal con autocierre y limpieza segura
  const successMessage = useTimedMessage(4000);

  // Hook CRUD
  const {
    items,
    loading,
    actionLoading,
    error: crudError,
    createItem,
    updateItem,
    deleteItem,
    clearMessages
  } = useCrud(endpoint, { filters: filterValues });

  // Modales
  const formModal = useModal(false);
  const deleteModal = useModal(false);

  // Manejo de formulario dinámico con useForm
  const {
    values: formData,
    handleFieldChange,
    reset: resetForm,
    error: formError,
    handleSubmit: handleSubmitForm
  } = useForm(initialFormValues, async (currentValues) => {
    const payload = onTransformSubmit ? onTransformSubmit(currentValues) : currentValues;

    if (formModal.data) {
      await updateItem(formModal.data._id, payload);
      successMessage.showMessage(`${title} actualizado correctamente`);
    } else {
      await createItem(payload);
      successMessage.showMessage(`${title} creado exitosamente`);
    }

    formModal.close();
  });

  // Manejo de cambios en filtros
  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir modal de creacion
  const handleOpenCreate = () => {
    resetForm(initialFormValues);
    clearMessages();
    formModal.openWithData(null);
  };

  // Abrir modal de edicion
  const handleOpenEdit = (item) => {
    const initial = onTransformInitial ? onTransformInitial(item) : { ...item };
    resetForm(initial);
    clearMessages();
    formModal.openWithData(item);
  };

  // Abrir modal de eliminacion
  const handleOpenDelete = (item) => {
    clearMessages();
    deleteModal.openWithData(item);
  };

  // Confirmar eliminacion
  const handleConfirmDelete = async () => {
    if (!deleteModal.data) return;

    try {
      await deleteItem(deleteModal.data._id);
      deleteModal.close();
      successMessage.showMessage('Registro eliminado correctamente');
    } catch (err) {
      // El error permanece en crudError y se visualiza dentro de ConfirmModal
    }
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
        {successMessage.message && (
          <div className="alert alert-success">
            <span>✅</span>
            <div>{successMessage.message}</div>
          </div>
        )}
        {crudError && !deleteModal.isOpen && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <div>{crudError}</div>
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
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const resetFilters = {};
                  filters.forEach((f) => {
                    resetFilters[f.name] = f.defaultValue || '';
                  });
                  setFilterValues(resetFilters);
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Cargando registros...
          </div>
        )}

        {/* Tabla de datos */}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron registros para mostrar.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th style={{ width: '130px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    {columns.map((col) => (
                      <td key={col.key} data-label={col.label}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td data-label="Acciones">
                      <div className="table-actions">
                        {extraRowActions && extraRowActions(item)}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(item)}
                          title="Editar"
                        >
                          ✏️
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

      {/* Modal de Formulario (Crear / Editar) */}
      {formModal.isOpen && (
        <div className="modal-overlay" onClick={formModal.close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {formModal.data ? `Editar ${title}` : `Nuevo ${title}`}
              </h3>
              <button
                className="modal-close-btn"
                onClick={formModal.close}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <span>⚠️</span>
                    <div>{formError}</div>
                  </div>
                )}

                {fields.map((field) => {
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
                          <option value="">{field.placeholder || 'Seleccione...'}</option>
                          {field.options &&
                            field.options.map((opt) => (
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

                  if (field.type === 'checkbox') {
                    return (
                      <div key={field.name} className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(formData[field.name])}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          />
                          <span style={{ fontWeight: 500 }}>{field.label}</span>
                        </label>
                      </div>
                    );
                  }

                  if (field.type === 'days') {
                    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const currentDays = Array.isArray(formData[field.name]) ? formData[field.name] : [];

                    return (
                      <div key={field.name} className="form-group">
                        <label className="form-label">{field.label}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {daysOfWeek.map((day) => (
                            <label
                              key={day}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.6rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
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
                  onClick={formModal.close}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Guardando...' : formModal.data ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmacion para eliminar */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Eliminar ${title}`}
        message={`¿Está seguro de que desea eliminar ${
          deleteModal.data ? `"${deleteModal.data.nombre || 'este registro'}"` : 'este registro'
        }? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={actionLoading}
        error={crudError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          deleteModal.close();
          clearMessages();
        }}
      />
    </div>
  );
};

export default EntityCrud;
