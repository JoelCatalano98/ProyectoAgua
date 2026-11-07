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
    errorStatus: crudErrorStatus,
    loadItems,
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
    setError: setFormError,
    fieldErrors,
    setFieldErrors,
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

  // Pre-validación del formulario del lado del cliente
  const validateForm = (values) => {
    const errors = {};
    fields.forEach((field) => {
      const isDisabled =
        typeof field.disabled === 'function'
          ? field.disabled(values)
          : Boolean(field.disabled);

      // Si el campo está deshabilitado, no validar obligatorio
      if (isDisabled) return;

      const val = values[field.name];

      // Campos obligatorios
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '')
        ) {
          errors[field.name] = `${field.label} es obligatorio`;
          return;
        }
      }

      // Validación personalizada por campo
      if (field.validate) {
        const customError = field.validate(val, values);
        if (customError) {
          errors[field.name] = customError;
          return;
        }
      }

      // Validaciones numéricas (precio >= 0, stock >= 0, etc.)
      if (field.type === 'number' || field.min !== undefined) {
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num)) {
            errors[field.name] = `${field.label} debe ser un número válido`;
          } else if (field.min !== undefined && num < field.min) {
            errors[field.name] = `${field.label} no puede ser menor a ${field.min}`;
          }
        }
      }

      // Validaciones de email
      if (field.type === 'email' && val) {
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_REGEX.test(String(val).trim())) {
          errors[field.name] = 'Formato de correo electrónico inválido';
        }
      }
    });
    return errors;
  };

  const handleFormSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setFormError('');

    // Pre-validación
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Por favor, corregí los errores indicados abajo');
      return;
    }

    try {
      await handleSubmitForm(e);
    } catch (err) {
      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const apiErrors = {};
        err.detalles.forEach((d) => {
          if (d.campo) apiErrors[d.campo] = d.mensaje;
        });
        setFieldErrors(apiErrors);
        setFormError('Por favor, corregí los errores indicados abajo');
      } else if (err.message) {
        const msg = err.message.toLowerCase();
        if (msg.includes('nombre') && !fieldErrors.nombre) {
          setFieldErrors({ nombre: err.message });
          setFormError('Por favor, corregí los errores indicados abajo');
        } else if (msg.includes('localidad') && !fieldErrors.localidad) {
          setFieldErrors({ localidad: err.message });
          setFormError('Por favor, corregí los errores indicados abajo');
        } else if (msg.includes('zona') && !fieldErrors.zona) {
          setFieldErrors({ zona: err.message });
          setFormError('Por favor, corregí los errores indicados abajo');
        } else {
          setFormError(err.message || 'Error al procesar la solicitud');
        }
      } else {
        setFormError('Error al procesar la solicitud');
      }
    }
  };

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

        {/* Alerta de exito flotante / visible */}
        {successMessage.message && (
          <div className="alert alert-success" style={{ margin: '1rem 1.5rem 0' }}>
            <span>✅</span>
            <div>{successMessage.message}</div>
          </div>
        )}

        {/* Alerta de error de listado */}
        {crudError && (
          <div className="alert alert-danger" style={{ margin: '1rem 1.5rem 0' }}>
            <span>⚠️</span>
            <div>{crudError}</div>
          </div>
        )}

        {/* Barra de Filtros */}
        {filters.length > 0 && (
          <div
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-main)'
            }}
          >
            {filters.map((filter) => (
              <div
                key={filter.name}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '180px' }}
              >
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)'
                  }}
                >
                  {filter.label}
                </label>
                <select
                  className="form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                  value={filterValues[filter.name] || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                >
                  <option value="">{filter.placeholder || 'Todos'}</option>
                  {filter.options &&
                    filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>
            ))}

            {Object.values(filterValues).some((v) => v !== '') && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const cleared = {};
                    filters.forEach((f) => {
                      cleared[f.name] = '';
                    });
                    setFilterValues(cleared);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando {title.toLowerCase()}...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No hay {title.toLowerCase()} registrados</h3>
            <p className="empty-description">
              Comenzá creando un nuevo registro con el botón superior.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{ width: '120px', textAlign: 'right' }}>Acciones</th>
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

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <span>⚠️</span>
                    <div>{formError}</div>
                  </div>
                )}

                {fields.map((field) => {
                  const hasError = Boolean(fieldErrors[field.name]);

                  if (field.render) {
                    return (
                      <div key={field.name} className="form-group">
                        {field.render({
                          formData,
                          handleFieldChange,
                          fieldErrors,
                          setFieldErrors,
                          hasError,
                          actionLoading
                        })}
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    const options =
                      typeof field.options === 'function'
                        ? field.options(formData)
                        : (field.options || []);
                    const isDisabled =
                      typeof field.disabled === 'function'
                        ? field.disabled(formData)
                        : Boolean(field.disabled);
                    const warning =
                      typeof field.warning === 'function'
                        ? field.warning(formData)
                        : field.warning;
                    const actionElement =
                      typeof field.action === 'function'
                        ? field.action({ formData, handleFieldChange, setFieldErrors })
                        : field.action;

                    return (
                      <div key={field.name} className="form-group">
                        <label className="form-label" htmlFor={field.name}>
                          {field.label} {field.required && '*'}
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            id={field.name}
                            className={`form-control ${hasError ? 'input-error' : ''}`}
                            value={formData[field.name] || ''}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (field.onChange) {
                                field.onChange(e.target.value, {
                                  handleFieldChange,
                                  formData,
                                  setFieldErrors
                                });
                              } else {
                                handleFieldChange(field.name, e.target.value);
                              }
                              if (fieldErrors[field.name]) {
                                setFieldErrors((prev) => ({ ...prev, [field.name]: '' }));
                              }
                            }}
                            style={{ flex: 1 }}
                          >
                            <option value="">{field.placeholder || 'Seleccione...'}</option>
                            {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {actionElement && (
                            <div style={{ flexShrink: 0 }}>{actionElement}</div>
                          )}
                        </div>
                        {warning && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {warning}
                          </div>
                        )}
                        {hasError && (
                          <span className="field-error">{fieldErrors[field.name]}</span>
                        )}
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
                          className={`form-control ${hasError ? 'input-error' : ''}`}
                          rows="3"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => {
                            handleFieldChange(field.name, e.target.value);
                            if (fieldErrors[field.name]) {
                              setFieldErrors((prev) => ({ ...prev, [field.name]: '' }));
                            }
                          }}
                        />
                        {hasError && (
                          <span className="field-error">{fieldErrors[field.name]}</span>
                        )}
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
                        {hasError && (
                          <span className="field-error">{fieldErrors[field.name]}</span>
                        )}
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
                        {hasError && (
                          <span className="field-error">{fieldErrors[field.name]}</span>
                        )}
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
                        className={`form-control ${hasError ? 'input-error' : ''}`}
                        placeholder={field.placeholder}
                        value={formData[field.name] !== undefined ? formData[field.name] : ''}
                        onChange={(e) => {
                          handleFieldChange(field.name, e.target.value);
                          if (fieldErrors[field.name]) {
                            setFieldErrors((prev) => ({ ...prev, [field.name]: '' }));
                          }
                        }}
                      />
                      {hasError && (
                        <span className="field-error">{fieldErrors[field.name]}</span>
                      )}
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
        confirmText="Sí, borrar"
        cancelText="Cancelar"
        loading={actionLoading}
        error={crudError}
        errorStatus={crudErrorStatus}
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
