import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

export const AuthContext = createContext(null);

// Límite de inactividad: 30 minutos
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Interceptor para atrapar 401 Unauthorized (token expirado / inválido)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      if (!window.location.pathname.includes('/login')) {
        navigate('/login', { replace: true });
      }
    };

    api.setUnauthorizedHandler(handleUnauthorized);
    return () => {
      api.setUnauthorizedHandler(null);
    };
  }, [logout, navigate]);

  // Detección de inactividad del usuario (Auto-logout tras 30 minutos sin interacción)
  useEffect(() => {
    if (!token) return;

    let timer = null;
    let lastActivity = Date.now();

    const handleAutoLogout = () => {
      logout();
      if (!window.location.pathname.includes('/login')) {
        navigate('/login', { replace: true });
      }
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleAutoLogout, INACTIVITY_TIMEOUT_MS);
    };

    const onUserActivity = () => {
      const now = Date.now();
      // Si el equipo estuvo suspendido o inactivo por más de 30 minutos
      if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
        return;
      }
      // Throttle de 1 segundo para no reiniciar el temporizador en cada micro-movimiento
      if (now - lastActivity > 1000) {
        lastActivity = now;
        resetTimer();
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
          handleAutoLogout();
        } else {
          resetTimer();
        }
      }
    };

    // Inicializar el temporizador de inactividad
    resetTimer();

    // Eventos que representan interacción activa del usuario
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'click', 'touchstart', 'scroll'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserActivity);
    });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [token, logout, navigate]);

  const login = async (email, password) => {
    const data = await api.post('/users/login', { email, password });
    if (data.token && data.user) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error('Respuesta de autenticación incompleta');
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth };
