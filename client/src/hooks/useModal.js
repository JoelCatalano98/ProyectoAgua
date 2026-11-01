import { useState, useCallback } from 'react';

/**
 * Hook para controlar apertura, cierre y datos asociados de modales o paneles.
 *
 * @param {boolean} [initialOpen=false] - Estado inicial de visibilidad del modal.
 * @returns {{
 *   isOpen: boolean,
 *   open: () => void,
 *   close: () => void,
 *   toggle: () => void,
 *   data: any,
 *   openWithData: (data: any) => void
 * }}
 */
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openWithData = useCallback((modalData) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  return { isOpen, open, close, toggle, data, openWithData };
};
