import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

const HojaRutaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(searchParams.get('zona') || '');
  const [hojaData, setHojaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar zonas disponibles
  useEffect(() => {
    api.get('/zones')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setZones(list);
        if (!selectedZoneId && list.length > 0) {
          setSelectedZoneId(list[0]._id);
        }
      })
      .catch(() => setZones([]));
  }, []);

  // Cargar hoja de ruta al cambiar de zona
  useEffect(() => {
    if (!selectedZoneId) return;

    setLoading(true);
    setError('');
    api.get(`/zones/${selectedZoneId}/hoja-de-ruta`)
      .then((data) => {
        setHojaData(data);
      })
      .catch((err) => {
        setError(err.message || 'Error al obtener la hoja de ruta');
        setHojaData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedZoneId]);

  const handleZoneChange = (e) => {
    const id = e.target.value;
    setSelectedZoneId(id);
    setSearchParams(id ? { zona: id } : {});
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="card no-print">
        <div className="card-header">
          <div>
            <h2 className="card-title">🚚 Hoja de Ruta para Repartidores</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Listado logístico de clientes activos ordenados por localidad y dirección
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handlePrint} disabled={!hojaData || loading}>
              🖨️ Imprimir Hoja
            </button>
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: '350px' }}>
          <label className="form-label" htmlFor="zoneSelect">
            Seleccionar Zona de Reparto:
          </label>
          <select
            id="zoneSelect"
            className="form-control"
            value={selectedZoneId}
            onChange={handleZoneChange}
          >
            <option value="">Seleccione una zona...</option>
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger no-print">
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Cargando recorrido logístico...
        </div>
      )}

      {!loading && hojaData && (
        <div className="card print-sheet">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                Hoja de Reparto: {hojaData.zona?.nombre}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Días de visita:{' '}
                <strong>
                  {hojaData.zona?.diasDeReparto?.join(', ') || 'No especificados'}
                </strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                {hojaData.totalClientesActivos} Clientes a Visitar
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Fecha emisión: {new Date().toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>

          {hojaData.clientes && hojaData.clientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No hay clientes activos registrados en las localidades de esta zona.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Localidad</th>
                    <th>Dirección</th>
                    <th>Cliente / Teléfono</th>
                    <th>Envases</th>
                    <th>Saldo</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {hojaData.clientes.map((c, index) => (
                    <tr key={c._id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Localidad">
                        <strong>{c.localidad?.nombre || '-'}</strong>
                      </td>
                      <td data-label="Dirección">
                        <strong>{c.direccion}</strong>
                      </td>
                      <td data-label="Cliente">
                        <div>{c.nombre}</div>
                        {c.telefono && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            📞 {c.telefono}
                          </div>
                        )}
                      </td>
                      <td data-label="Envases">💧 {c.envasesEnPoder || 0}</td>
                      <td data-label="Saldo">
                        ${Number(c.saldo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td data-label="Observaciones">
                        <small>{c.observaciones || '-'}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HojaRutaPage;
