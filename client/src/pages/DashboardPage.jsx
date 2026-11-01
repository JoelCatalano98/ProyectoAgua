import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    activeClientsCount: 0,
    totalClientsCount: 0,
    zonesCount: 0,
    categoriesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTotals = async () => {
      setLoading(true);
      setError('');
      try {
        const [products, activeClients, allClients, zones, categories] = await Promise.all([
          api.get('/products').catch(() => []),
          api.get('/clients', { activo: 'true' }).catch(() => []),
          api.get('/clients').catch(() => []),
          api.get('/zones').catch(() => []),
          api.get('/categories').catch(() => [])
        ]);

        setStats({
          productsCount: Array.isArray(products) ? products.length : 0,
          activeClientsCount: Array.isArray(activeClients) ? activeClients.length : 0,
          totalClientsCount: Array.isArray(allClients) ? allClients.length : 0,
          zonesCount: Array.isArray(zones) ? zones.length : 0,
          categoriesCount: Array.isArray(categories) ? categories.length : 0
        });
      } catch (err) {
        setError('Error al consultar estadísticas iniciales');
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Panel Principal</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Resumen operativo del sistema de reparto y distribución de agua
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {/* Grid de totales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.productsCount}</div>
            <div className="stat-label">Productos & Servicios</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.activeClientsCount}</div>
            <div className="stat-label">Clientes Activos ({stats.totalClientsCount} total)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">🗺️</div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.zonesCount}</div>
            <div className="stat-label">Zonas de Reparto</div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Accesos Rápidos</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/clients" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>👥</span>
            <span>Gestionar Clientes</span>
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📦</span>
            <span>Catálogo de Productos</span>
          </Link>
          <Link to="/hoja-de-ruta" className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🚚</span>
            <span>Ver Hoja de Ruta</span>
          </Link>
          <Link to="/zones" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>🗺️</span>
            <span>Zonas y Días de Entrega</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
