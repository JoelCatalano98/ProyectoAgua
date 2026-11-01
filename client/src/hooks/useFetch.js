import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

/**
 * Hook para peticiones asíncronas de datos con manejo de loading, error y cancelación de respuestas tardías.
 *
 * @param {string|Function|null} fetcherOrUrl - Endpoint string de la API o función asíncrona que retorna una Promesa.
 * @param {Array} dependencies - Lista de dependencias que disparan una nueva petición al cambiar.
 * @param {any} initialData - Valor inicial para el estado data.
 * @returns {{ data: any, loading: boolean, error: string, refetch: Function, setData: Function }}
 */
export const useFetch = (fetcherOrUrl, dependencies = [], initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(fetcherOrUrl));
  const [error, setError] = useState('');

  const fetcherRef = useRef(fetcherOrUrl);
  fetcherRef.current = fetcherOrUrl;

  const execute = useCallback(async (isMounted) => {
    const target = fetcherRef.current;
    if (!target) {
      if (isMounted()) {
        setLoading(false);
      }
      return;
    }

    if (isMounted()) {
      setLoading(true);
      setError('');
    }

    try {
      let result;
      if (typeof target === 'string') {
        result = await api.get(target);
      } else if (typeof target === 'function') {
        result = await target();
      }

      if (isMounted()) {
        setData(result);
        setError('');
      }
      return result;
    } catch (err) {
      if (isMounted()) {
        setError(err.message || 'Error al obtener los datos');
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    execute(isMounted);

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(() => {
    let mounted = true;
    return execute(() => mounted);
  }, [execute]);

  return { data, loading, error, refetch, setData };
};
