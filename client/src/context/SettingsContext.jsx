import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicSettings = async () => {
      try {
        const data = await api.get('/settings/public');
        if (isMounted && data && data.nombreEmpresa) {
          setNombreEmpresa(data.nombreEmpresa);
        }
      } catch (err) {
        // Silencioso para fallback neutro si el backend aún no responde
        console.warn('No se pudo cargar la configuración pública:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublicSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (nombreEmpresa) {
      document.title = `${nombreEmpresa} - Panel de Gestión`;
    } else {
      document.title = 'Panel de Gestión';
    }
  }, [nombreEmpresa]);

  return (
    <SettingsContext.Provider value={{ nombreEmpresa, setNombreEmpresa, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings debe ser utilizado dentro de un SettingsProvider');
  }
  return context;
};
