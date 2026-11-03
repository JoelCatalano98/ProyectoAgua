import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

/**
 * Hook para la gestión completa de operaciones CRUD sobre un endpoint REST.
 *
 * @param {string} endpoint - Ruta base de la entidad (ej: '/categories').
 * @param {object} [options={}] - Configuración opcional con filtros.
 * @param {object} [options.filters] - Parámetros de consulta (query params) para el listado.
 * @returns {{
 *   items: Array,
 *   loading: boolean,
 *   actionLoading: boolean,
 *   error: string,
 *   errorStatus: number|null,
 *   errorDetalles: Array,
 *   detalles: Array,
 *   isBusinessRuleError: boolean,
 *   success: string,
 *   loadItems: () => Promise<Array>,
 *   createItem: (data: object) => Promise<any>,
 *   updateItem: (id: string, data: object) => Promise<any>,
 *   deleteItem: (id: string) => Promise<any>,
 *   clearMessages: () => void,
 *   setError: (msg: string) => void,
 *   setErrorDetalles: (detalles: Array) => void,
 *   setSuccess: (msg: string) => void
 * }}
 */
export const useCrud = (endpoint, options = {}) => {
  const { filters = {} } = options;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorDetalles, setErrorDetalles] = useState([]);
  const [success, setSuccess] = useState('');

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    setErrorStatus(null);
    setErrorDetalles([]);
    try {
      const data = await api.get(endpoint, filtersRef.current);
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      return list;
    } catch (err) {
      const msg = err.message || 'Error al cargar los registros';
      setError(msg);
      setErrorStatus(err.status ?? null);
      setErrorDetalles(err.detalles || []);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadItems().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadItems, JSON.stringify(filters)]);

  const createItem = useCallback(
    async (payload) => {
      setActionLoading(true);
      setError('');
      setErrorStatus(null);
      setErrorDetalles([]);
      try {
        const result = await api.post(endpoint, payload);
        setSuccess('Registro creado exitosamente');
        await loadItems().catch(() => {});
        return result;
      } catch (err) {
        const msg = err.message || 'Error al crear el registro';
        setError(msg);
        setErrorStatus(err.status ?? null);
        setErrorDetalles(err.detalles || []);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [endpoint, loadItems]
  );

  const updateItem = useCallback(
    async (id, payload) => {
      setActionLoading(true);
      setError('');
      setErrorStatus(null);
      setErrorDetalles([]);
      try {
        const result = await api.put(`${endpoint}/${id}`, payload);
        setSuccess('Registro actualizado correctamente');
        await loadItems().catch(() => {});
        return result;
      } catch (err) {
        const msg = err.message || 'Error al actualizar el registro';
        setError(msg);
        setErrorStatus(err.status ?? null);
        setErrorDetalles(err.detalles || []);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [endpoint, loadItems]
  );

  const deleteItem = useCallback(
    async (id) => {
      setActionLoading(true);
      setError('');
      setErrorStatus(null);
      setErrorDetalles([]);
      try {
        const result = await api.delete(`${endpoint}/${id}`);
        setSuccess('Registro eliminado correctamente');
        await loadItems().catch(() => {});
        return result;
      } catch (err) {
        const msg = err.message || 'Error al eliminar el registro';
        setError(msg);
        setErrorStatus(err.status ?? null);
        setErrorDetalles(err.detalles || []);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [endpoint, loadItems]
  );

  const clearMessages = useCallback(() => {
    setError('');
    setErrorStatus(null);
    setErrorDetalles([]);
    setSuccess('');
  }, []);

  return {
    items,
    loading,
    actionLoading,
    error,
    errorStatus,
    errorDetalles,
    detalles: errorDetalles,
    isBusinessRuleError: Boolean(
      error && (errorStatus === 400 || errorStatus === 409)
    ),
    success,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    clearMessages,
    setError,
    setErrorDetalles,
    setSuccess
  };
};
