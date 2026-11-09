import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../hooks/useModal';
import { useSettings } from '../hooks/useSettings';
import InstallPrompt from './InstallPrompt';

const Layout = () => {
  const { user, logout } = useAuth();
  const { nombreEmpresa, loading: settingsLoading } = useSettings();
  const mobileMenu = useModal(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Overlay para cerrar el menú en móviles */}
      {mobileMenu.isOpen && (
        <div className="sidebar-overlay" onClick={mobileMenu.close} />
      )}

      {/* Barra lateral */}
      <aside className={`sidebar ${mobileMenu.isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="brand-title">
            {settingsLoading ? '\u00A0' : (nombreEmpresa || 'Panel')}
          </span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">📦</span>
            <span>Productos</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">🏷️</span>
            <span>Categorías</span>
          </NavLink>

          <NavLink
            to="/zones"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">🗺️</span>
            <span>Zonas</span>
          </NavLink>

          <NavLink
            to="/localities"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">📍</span>
            <span>Localidades</span>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">👥</span>
            <span>Clientes</span>
          </NavLink>

          <NavLink
            to="/hoja-de-ruta"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={mobileMenu.close}
          >
            <span className="nav-icon">🚚</span>
            <span>Hoja de Ruta</span>
          </NavLink>

          {user?.rol === 'admin' && (
            <NavLink
              to="/configuracion"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={mobileMenu.close}
            >
              <span className="nav-icon">⚙️</span>
              <span>Configuración</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-badge">
              <div className="user-avatar">
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.nombre || user.email}</span>
                <span className="user-role">{user.rol || 'Operador'}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm btn-block"
            title="Cerrar sesión"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              onClick={mobileMenu.toggle}
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <h1 className="page-title">
              {settingsLoading ? 'Sistema de Gestión' : (nombreEmpresa || 'Sistema de Gestión')}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InstallPrompt />
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
