import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useSettings } from '../hooks/useSettings';
import { useCrud } from '../hooks/useCrud';
import { useModal } from '../hooks/useModal';
import { useForm } from '../hooks/useForm';
import { useTimedMessage } from '../hooks/useTimedMessage';
import ConfirmModal from '../components/ConfirmModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ConfiguracionPage = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  const { nombreEmpresa, setNombreEmpresa, loading: settingsLoading } = useSettings();
  const successMessage = useTimedMessage(4000);

  // Hook CRUD para usuarios
  const {
    items: users,
    loading: usersLoading,
    actionLoading,
    error: crudError,
    errorStatus: crudErrorStatus,
    loadItems: reloadUsers,
    createItem: createUserData,
    updateItem: updateUserData,
    clearMessages: clearCrudMessages
  } = useCrud('/users');

  // Modales
  const createUserModal = useModal(false);
  const editUserModal = useModal(false);
  const resetPasswordModal = useModal(false);
  const confirmModal = useModal(false);

  // Estado adicional para confirmación de cambio de estado / contraseña
  const [confirmData, setConfirmData] = useState({
    title: '',
    message: '',
    confirmText: '',
    isDanger: false,
    action: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmErrorStatus, setConfirmErrorStatus] = useState(null);

  // ================= PESTAÑA EMPRESA =================
  const empresaForm = useForm(
    { nombreEmpresa: '' },
    async (values) => {
      const trimmed = (values.nombreEmpresa || '').trim();
      if (!trimmed || trimmed.length < 2) {
        empresaForm.setFieldError('nombreEmpresa', 'El nombre debe tener al menos 2 caracteres');
        throw new Error('Por favor, corregí los errores indicados abajo');
      }
      if (trimmed.length > 80) {
        empresaForm.setFieldError('nombreEmpresa', 'El nombre no puede superar los 80 caracteres');
        throw new Error('Por favor, corregí los errores indicados abajo');
      }

      const res = await api.put('/settings', { nombreEmpresa: trimmed });
      if (res && res.nombreEmpresa) {
        setNombreEmpresa(res.nombreEmpresa);
        successMessage.showMessage('Nombre de empresa actualizado exitosamente');
      }
    }
  );

  // Sincronizar valor inicial de la empresa cuando cargue el contexto
  useEffect(() => {
    if (nombreEmpresa && !empresaForm.values.nombreEmpresa) {
      empresaForm.setValues({ nombreEmpresa });
    }
  }, [nombreEmpresa]);

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    empresaForm.setError('');
    const trimmed = (empresaForm.values.nombreEmpresa || '').trim();
    if (!trimmed || trimmed.length < 2) {
      empresaForm.setFieldError('nombreEmpresa', 'El nombre debe tener al menos 2 caracteres');
      empresaForm.setError('Por favor, corregí los errores indicados abajo');
      return;
    }
    if (trimmed.length > 80) {
      empresaForm.setFieldError('nombreEmpresa', 'El nombre no puede superar los 80 caracteres');
      empresaForm.setError('Por favor, corregí los errores indicados abajo');
      return;
    }

    try {
      await empresaForm.handleSubmit(e);
    } catch (err) {
      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const errors = {};
        err.detalles.forEach((d) => {
          if (d.campo) errors[d.campo] = d.mensaje;
        });
        empresaForm.setFieldErrors(errors);
        empresaForm.setError('Por favor, corregí los errores indicados abajo');
      } else {
        empresaForm.setError(err.message || 'Error al guardar la configuración');
      }
    }
  };

  // ================= ALTA DE USUARIO =================
  const createUserForm = useForm(
    {
      nombre: '',
      email: '',
      password: '',
      rol: 'repartidor',
      activo: true
    },
    async (values) => {
      await createUserData(values);
      createUserModal.close();
      successMessage.showMessage('Usuario creado exitosamente');
    }
  );

  const handleOpenCreateUser = () => {
    createUserForm.reset({
      nombre: '',
      email: '',
      password: '',
      rol: 'repartidor',
      activo: true
    });
    clearCrudMessages();
    createUserModal.open();
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    createUserForm.setError('');
    const errors = {};

    const emailTrimmed = (createUserForm.values.email || '').trim();
    if (!emailTrimmed) {
      errors.email = 'El email es requerido';
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = 'Formato de correo electrónico inválido';
    }

    const pass = createUserForm.values.password || '';
    if (!pass) {
      errors.password = 'La contraseña es requerida';
    } else if (pass.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (pass.length > 72) {
      errors.password = 'La contraseña no puede superar los 72 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      createUserForm.setFieldErrors(errors);
      createUserForm.setError('Por favor, corregí los errores indicados abajo');
      return;
    }

    try {
      await createUserForm.handleSubmit(e);
    } catch (err) {
      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const apiErrors = {};
        err.detalles.forEach((d) => {
          if (d.campo) apiErrors[d.campo] = d.mensaje;
        });
        createUserForm.setFieldErrors(apiErrors);
        createUserForm.setError('Por favor, corregí los errores indicados abajo');
      } else {
        createUserForm.setError(err.message || 'Error al crear el usuario');
      }
    }
  };

  // ================= EDICIÓN DE USUARIO =================
  const editUserForm = useForm(
    {
      nombre: '',
      rol: 'repartidor',
      activo: true
    },
    async (values) => {
      if (!editUserModal.data) return;
      await updateUserData(editUserModal.data._id, {
        nombre: values.nombre.trim(),
        rol: values.rol,
        activo: Boolean(values.activo)
      });
      editUserModal.close();
      successMessage.showMessage('Usuario actualizado correctamente');
    }
  );

  const handleOpenEditUser = (user) => {
    editUserForm.reset({
      nombre: user.nombre || '',
      rol: user.rol || 'repartidor',
      activo: user.activo !== false
    });
    clearCrudMessages();
    editUserModal.openWithData(user);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    editUserForm.setError('');
    try {
      await editUserForm.handleSubmit(e);
    } catch (err) {
      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const apiErrors = {};
        err.detalles.forEach((d) => {
          if (d.campo) apiErrors[d.campo] = d.mensaje;
        });
        editUserForm.setFieldErrors(apiErrors);
        editUserForm.setError('Por favor, corregí los errores indicados abajo');
      } else {
        editUserForm.setError(err.message || 'Error al actualizar el usuario');
      }
    }
  };

  // ================= RESTABLECER CONTRASEÑA =================
  const resetPasswordForm = useForm(
    {
      password: '',
      confirmPassword: ''
    },
    async (values) => {
      if (!resetPasswordModal.data) return;
      await api.patch(`/users/${resetPasswordModal.data._id}/password`, {
        password: values.password
      });
      resetPasswordModal.close();
      successMessage.showMessage('Contraseña restablecida correctamente');
    }
  );

  const handleOpenResetPassword = (user) => {
    resetPasswordForm.reset({
      password: '',
      confirmPassword: ''
    });
    resetPasswordModal.openWithData(user);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    resetPasswordForm.setError('');
    const errors = {};

    const pass = resetPasswordForm.values.password || '';
    if (!pass) {
      errors.password = 'La contraseña es requerida';
    } else if (pass.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (pass.length > 72) {
      errors.password = 'La contraseña no puede superar los 72 caracteres';
    }

    if (pass !== resetPasswordForm.values.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errors).length > 0) {
      resetPasswordForm.setFieldErrors(errors);
      resetPasswordForm.setError('Por favor, corregí los errores indicados abajo');
      return;
    }

    // Modal de confirmación para restablecer la contraseña
    setConfirmError('');
    setConfirmErrorStatus(null);
    setConfirmData({
      title: 'Restablecer contraseña',
      message: `¿Confirmás el restablecimiento de la contraseña para el usuario ${resetPasswordModal.data.email}?`,
      confirmText: 'Sí, restablecer',
      isDanger: true,
      action: async () => {
        try {
          setConfirmLoading(true);
          await resetPasswordForm.handleSubmit(e);
          confirmModal.close();
        } catch (err) {
          setConfirmError(err.message || 'Error al restablecer la contraseña');
          setConfirmErrorStatus(err.status || 400);
        } finally {
          setConfirmLoading(false);
        }
      }
    });
    confirmModal.open();
  };

  return (
    <div className="configuracion-page">
      {/* Encabezado */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <div>
            <h2 className="card-title">Configuración del Sistema</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Gestión general de la empresa y administración de usuarios
            </p>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="tabs-header" style={{ padding: '0 1.5rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'empresa' ? 'active' : ''}`}
            onClick={() => setActiveTab('empresa')}
          >
            🏢 Empresa
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('usuarios');
              clearCrudMessages();
            }}
          >
            👥 Usuarios
          </button>
        </div>
      </div>

      {/* Alerta de éxito global */}
      {successMessage.message && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✅</span>
          <div>{successMessage.message}</div>
        </div>
      )}

      {/* ================= CONTENIDO PESTAÑA EMPRESA ================= */}
      {activeTab === 'empresa' && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
              Datos de la Empresa
            </h3>
          </div>
          <div className="card-body" style={{ padding: '1.5rem' }}>
            {empresaForm.error && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                <span>⚠️</span>
                <div>{empresaForm.error}</div>
              </div>
            )}

            <form onSubmit={handleEmpresaSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="nombreEmpresa">
                  Nombre Comercial de la Empresa <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="nombreEmpresa"
                  name="nombreEmpresa"
                  type="text"
                  className={`form-control ${empresaForm.fieldErrors.nombreEmpresa ? 'input-error' : ''}`}
                  placeholder="Ej: Distribuidora de Agua S.A."
                  value={empresaForm.values.nombreEmpresa}
                  onChange={empresaForm.handleChange}
                  disabled={empresaForm.isSubmitting || settingsLoading}
                />
                {empresaForm.fieldErrors.nombreEmpresa && (
                  <span className="field-error">{empresaForm.fieldErrors.nombreEmpresa}</span>
                )}
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                  Este nombre se refleja en la barra superior, el menú lateral y la pantalla de inicio de sesión.
                </small>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={empresaForm.isSubmitting || settingsLoading}
                >
                  {empresaForm.isSubmitting ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONTENIDO PESTAÑA USUARIOS ================= */}
      {activeTab === 'usuarios' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                Usuarios del Sistema
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Control de acceso, roles y estados de actividad
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateUser}>
              ➕ Nuevo Usuario
            </button>
          </div>

          {crudError && (
            <div className="alert alert-danger" style={{ margin: '1rem 1.5rem' }}>
              <span>⚠️</span>
              <div>{crudError}</div>
            </div>
          )}

          {usersLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Cargando usuarios...
            </div>
          )}

          {!usersLoading && users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontraron usuarios registrados.
            </div>
          )}

          {!usersLoading && users.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Alta</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td data-label="Nombre">
                        <strong>{u.nombre || '-'}</strong>
                      </td>
                      <td data-label="Correo Electrónico">{u.email}</td>
                      <td data-label="Rol">
                        <span
                          className={`badge ${
                            u.rol === 'admin' ? 'badge-primary' : 'badge-neutral'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`badge ${
                            u.activo !== false ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {u.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="Fecha Alta">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('es-AR')
                          : '-'}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditUser(u)}
                            title="Editar usuario"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenResetPassword(u)}
                            title="Restablecer contraseña"
                          >
                            🔑 Clave
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
      )}

      {/* ================= MODAL CREAR USUARIO ================= */}
      {createUserModal.isOpen && (
        <div className="modal-overlay" onClick={createUserModal.close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Usuario</h3>
              <button
                className="modal-close-btn"
                onClick={createUserModal.close}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} noValidate>
              <div className="modal-body">
                {createUserForm.error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <span>⚠️</span>
                    <div>{createUserForm.error}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="user-nombre">
                    Nombre completo
                  </label>
                  <input
                    id="user-nombre"
                    name="nombre"
                    type="text"
                    className={`form-control ${
                      createUserForm.fieldErrors.nombre ? 'input-error' : ''
                    }`}
                    placeholder="Ej: Juan Pérez"
                    value={createUserForm.values.nombre}
                    onChange={createUserForm.handleChange}
                    disabled={actionLoading}
                  />
                  {createUserForm.fieldErrors.nombre && (
                    <span className="field-error">{createUserForm.fieldErrors.nombre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-email">
                    Correo Electrónico <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    className={`form-control ${
                      createUserForm.fieldErrors.email ? 'input-error' : ''
                    }`}
                    placeholder="usuario@empresa.com"
                    value={createUserForm.values.email}
                    onChange={createUserForm.handleChange}
                    disabled={actionLoading}
                  />
                  {createUserForm.fieldErrors.email && (
                    <span className="field-error">{createUserForm.fieldErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-password">
                    Contraseña <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="user-password"
                    name="password"
                    type="password"
                    className={`form-control ${
                      createUserForm.fieldErrors.password ? 'input-error' : ''
                    }`}
                    placeholder="Mínimo 6 caracteres"
                    value={createUserForm.values.password}
                    onChange={createUserForm.handleChange}
                    disabled={actionLoading}
                  />
                  {createUserForm.fieldErrors.password && (
                    <span className="field-error">{createUserForm.fieldErrors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="user-rol">
                    Rol en el Sistema
                  </label>
                  <select
                    id="user-rol"
                    name="rol"
                    className="form-control"
                    value={createUserForm.values.rol}
                    onChange={createUserForm.handleChange}
                    disabled={actionLoading}
                  >
                    <option value="repartidor">Repartidor (Operador)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <input
                      type="checkbox"
                      name="activo"
                      checked={Boolean(createUserForm.values.activo)}
                      onChange={(e) =>
                        createUserForm.setValues((prev) => ({
                          ...prev,
                          activo: e.target.checked
                        }))
                      }
                      disabled={actionLoading}
                    />
                    Usuario activo (permite iniciar sesión)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={createUserModal.close}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL EDITAR USUARIO ================= */}
      {editUserModal.isOpen && (
        <div className="modal-overlay" onClick={editUserModal.close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Usuario</h3>
              <button
                className="modal-close-btn"
                onClick={editUserModal.close}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} noValidate>
              <div className="modal-body">
                {editUserForm.error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <span>⚠️</span>
                    <div>{editUserForm.error}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUserModal.data?.email || ''}
                    disabled
                    style={{ backgroundColor: '#f8fafc', color: 'var(--text-muted)' }}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>
                    El correo electrónico no se puede modificar.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-user-nombre">
                    Nombre completo
                  </label>
                  <input
                    id="edit-user-nombre"
                    name="nombre"
                    type="text"
                    className={`form-control ${
                      editUserForm.fieldErrors.nombre ? 'input-error' : ''
                    }`}
                    value={editUserForm.values.nombre}
                    onChange={editUserForm.handleChange}
                    disabled={actionLoading}
                  />
                  {editUserForm.fieldErrors.nombre && (
                    <span className="field-error">{editUserForm.fieldErrors.nombre}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-user-rol">
                    Rol en el Sistema
                  </label>
                  <select
                    id="edit-user-rol"
                    name="rol"
                    className="form-control"
                    value={editUserForm.values.rol}
                    onChange={editUserForm.handleChange}
                    disabled={actionLoading}
                  >
                    <option value="repartidor">Repartidor (Operador)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <input
                      type="checkbox"
                      name="activo"
                      checked={Boolean(editUserForm.values.activo)}
                      onChange={(e) =>
                        editUserForm.setValues((prev) => ({
                          ...prev,
                          activo: e.target.checked
                        }))
                      }
                      disabled={actionLoading}
                    />
                    Usuario activo (permite iniciar sesión)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={editUserModal.close}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL RESTABLECER CONTRASEÑA ================= */}
      {resetPasswordModal.isOpen && (
        <div className="modal-overlay" onClick={resetPasswordModal.close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Restablecer Contraseña</h3>
              <button
                className="modal-close-btn"
                onClick={resetPasswordModal.close}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} noValidate>
              <div className="modal-body">
                {resetPasswordForm.error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <span>⚠️</span>
                    <div>{resetPasswordForm.error}</div>
                  </div>
                )}

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Ingresá una nueva contraseña para el usuario{' '}
                  <strong>{resetPasswordModal.data?.email}</strong>.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-pass">
                    Nueva Contraseña <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="reset-pass"
                    name="password"
                    type="password"
                    className={`form-control ${
                      resetPasswordForm.fieldErrors.password ? 'input-error' : ''
                    }`}
                    placeholder="Mínimo 6 caracteres"
                    value={resetPasswordForm.values.password}
                    onChange={resetPasswordForm.handleChange}
                    autoFocus
                  />
                  {resetPasswordForm.fieldErrors.password && (
                    <span className="field-error">
                      {resetPasswordForm.fieldErrors.password}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-confirm-pass">
                    Confirmar Contraseña <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="reset-confirm-pass"
                    name="confirmPassword"
                    type="password"
                    className={`form-control ${
                      resetPasswordForm.fieldErrors.confirmPassword ? 'input-error' : ''
                    }`}
                    placeholder="Reingresá la contraseña"
                    value={resetPasswordForm.values.confirmPassword}
                    onChange={resetPasswordForm.handleChange}
                  />
                  {resetPasswordForm.fieldErrors.confirmPassword && (
                    <span className="field-error">
                      {resetPasswordForm.fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetPasswordModal.close}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CONFIRMACIÓN REUTILIZABLE ================= */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        isDanger={confirmData.isDanger}
        loading={confirmLoading}
        error={confirmError}
        errorStatus={confirmErrorStatus}
        onConfirm={confirmData.action}
        onCancel={() => {
          confirmModal.close();
          setConfirmError('');
          setConfirmErrorStatus(null);
        }}
      />
    </div>
  );
};

export default ConfiguracionPage;
