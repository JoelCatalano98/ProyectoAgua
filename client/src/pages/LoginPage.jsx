import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { useSettings } from '../hooks/useSettings';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const { login } = useAuth();
  const { nombreEmpresa, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    values,
    setValues,
    handleChange,
    isSubmitting: loading,
    error,
    setError,
    fieldErrors,
    setFieldError,
    setFieldErrors,
    handleSubmit
  } = useForm({ email: '', password: '' });

  const validate = () => {
    const errors = {};
    const emailTrimmed = (values.email || '').trim();
    const pass = values.password || '';

    if (!emailTrimmed) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = 'Formato de correo electrónico inválido';
    }

    if (!pass) {
      errors.password = 'La contraseña es requerida';
    } else if (pass.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return errors;
  };

  const onSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setError('');
    setNetworkError(false);

    // Pre-validación del lado del cliente
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Por favor, corregí los errores indicados abajo');
      return;
    }

    try {
      await login(values.email.trim(), values.password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 429) {
        setIsRateLimited(true);
        setError(
          err.message ||
            'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.'
        );
      } else if (err.status === 0 || err.isNetworkError) {
        setNetworkError(true);
        setError(
          err.message ||
            'No se pudo conectar con el servidor. Verificá tu conexión o que el servicio esté activo'
        );
      } else if (err.status === 401) {
        setError('Credenciales inválidas');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }

      if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
        const errors = {};
        err.detalles.forEach((d) => {
          if (d.campo) errors[d.campo] = d.mensaje;
        });
        setFieldErrors(errors);
      }
    }
  };


  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>{settingsLoading ? '\u00A0' : (nombreEmpresa || 'Panel de Gestión')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Panel de Administración y Reparto
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span>⚠️</span>
              <div style={{ flex: 1 }}>{error}</div>
            </div>
            {networkError && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onSubmit}
                style={{ alignSelf: 'flex-end', marginTop: '0.25rem' }}
              >
                🔄 Reintentar conexión
              </button>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${fieldErrors.email ? 'input-error' : ''}`}
              placeholder="ejemplo@correo.com"
              value={values.email}
              onChange={handleChange}
              disabled={loading || isRateLimited}
              autoFocus
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control ${fieldErrors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              disabled={loading || isRateLimited}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || isRateLimited}
            style={{ marginTop: '1.25rem' }}
          >
            {loading ? 'Iniciando sesión...' : isRateLimited ? 'Acceso temporalmente bloqueado' : 'Ingresar al Sistema'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setValues({
                  email: 'admin@aguapura.com',
                  password: 'admin1234'
                });
                setFieldErrors({});
                setError('');
                setIsRateLimited(false);
                setNetworkError(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Cargar credenciales de prueba (admin)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
