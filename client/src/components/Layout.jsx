import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Overlay para cerrar el menú en móviles */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Barra lateral */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="brand-icon">💧</span>
          <span className="brand-title">Agua Pura ERP</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📦</span>
            <span>Productos</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">🏷️</span>
            <span>Categorías</span>
          </NavLink>

          <NavLink
            to="/zones"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">🗺️</span>
            <span>Zonas</span>
          </NavLink>

          <NavLink
            to="/localities"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📍</span>
            <span>Localidades</span>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">👥</span>
            <span>Clientes</span>
          </NavLink>

          <NavLink
            to="/hoja-de-ruta"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">🚚</span>
            <span>Hoja de Ruta</span>
          </NavLink>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <h1 className="page-title">Sistema de Gestión</h1>
          </div>
          <div>
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
