import { useState, useCallback } from 'react';

/**
 * Hook para la gestión de campos, validación y envío de formularios.
 *
 * @param {object} [initialValues={}] - Valores iniciales del formulario.
 * @param {Function} [onSubmit] - Callback de procesamiento del formulario.
 * @returns {{
 *   values: object,
 *   setValues: Function,
 *   handleChange: (e: object) => void,
 *   handleFieldChange: (name: string, value: any) => void,
 *   reset: (newValues?: object) => void,
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

  const handleFieldChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, id, value, type, checked } = e.target;
    const key = name || id;
    const finalValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [key]: finalValue }));
  }, []);

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setError('');
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
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, values]
  );

  return {
    values,
    setValues,
    handleChange,
    handleFieldChange,
    reset,
    isSubmitting,
    error,
    setError,
    handleSubmit
  };
};
