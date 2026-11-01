import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook para mensajes temporales (ej: notificaciones de éxito) con autocierre y limpieza segura de timers.
 *
 * @param {number} [duration=4000] - Duración en milisegundos tras la cual se limpia el mensaje.
 * @returns {{
 *   message: string,
 *   showMessage: (msg: string) => void,
 *   clearMessage: () => void
 * }}
 */
export const useTimedMessage = (duration = 4000) => {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  const clearMessage = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage('');
  }, []);

  const showMessage = useCallback(
    (msg) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage(msg);
      timerRef.current = setTimeout(() => {
        setMessage('');
        timerRef.current = null;
      }, duration);
    },
    [duration]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { message, showMessage, clearMessage };
};
