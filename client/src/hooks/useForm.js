import { useState, useCallback } from 'react';

/**
 * Hook para la gestión de campos, validación enriquecida y envío de formularios.
 *
 * @param {object} [initialValues={}] - Valores iniciales del formulario.
 * @param {Function} [onSubmit] - Callback asincrónico ejecutado al enviar el formulario.
 * @returns {{
 *   values: object,
 *   setValues: Function,
 *   fieldErrors: object,
 *   setFieldErrors: Function,
 *   setFieldError: (campo: string, mensaje: string) => void,
 *   clearFieldError: (campo: string) => void,
 *   setErrorsFromApi: (detalles: Array) => void,
 *   handleChange: (e: object) => void,
 *   handleFieldChange: (name: string, value: any) => void,
 *   reset: (newValues?: object) => void,
 *   resetForm: (newValues?: object) => void,
 *   isSubmitting: boolean,
 *   error: string,
 *   setError: (msg: string) => void,
 *   handleSubmit: (e?: object) => Promise<any>
 * }}
 */
export const useForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = useCallback((campo) => {
    setFieldErrors((prev) => {
      if (!prev[campo]) return prev;
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  }, []);

  const setFieldError = useCallback((campo, mensaje) => {
    setFieldErrors((prev) => ({ ...prev, [campo]: mensaje }));
  }, []);

  const setErrorsFromApi = useCallback((detalles) => {
    if (!Array.isArray(detalles)) return;
    const errors = {};
    detalles.forEach((d) => {
      if (d.campo && d.mensaje) {
        errors[d.campo] = d.mensaje;
      }
    });
    setFieldErrors(errors);
  }, []);

  const handleFieldChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      clearFieldError(name);
    },
    [clearFieldError]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, id, value, type, checked } = e.target;
      const key = name || id;
      const finalValue = type === 'checkbox' ? checked : value;
      setValues((prev) => ({ ...prev, [key]: finalValue }));
      clearFieldError(key);
    },
    [clearFieldError]
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setError('');
      setFieldErrors({});
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      setError('');
      if (!onSubmit) return;

      setIsSubmitting(true);
      try {
        const result = await onSubmit(values);
        return result;
      } catch (err) {
        const msg = err.message || 'Error al procesar el formulario';
        setError(msg);
        if (err.detalles && Array.isArray(err.detalles) && err.detalles.length > 0) {
          setErrorsFromApi(err.detalles);
        }
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, values, setErrorsFromApi]
  );

  return {
    values,
    setValues,
    fieldErrors,
    setFieldErrors,
    setFieldError,
    clearFieldError,
    setErrorsFromApi,
    handleChange,
    handleFieldChange,
    reset,
    resetForm: reset,
    isSubmitting,
    error,
    setError,
    handleSubmit
  };
};
