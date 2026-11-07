import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useFetch } from '../hooks/useFetch';

const HojaRutaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocalityId, setSelectedLocalityId] = useState(
    searchParams.get('localidad') || ''
  );
  const [hojas, setHojas] = useState([]);
  const [loadingHojas, setLoadingHojas] = useState(false);
  const [hojasError, setHojasError] = useState('');

  // 1. Cargar lista de localidades disponibles
  const { data: localitiesData, error: localitiesError } = useFetch('/localities', [], []);
  const localities = Array.isArray(localitiesData) ? localitiesData : [];

  // 2. Resolver parámetros de URL (si viene ?zona= resolver su localidad, o ?localidad=)
  useEffect(() => {
    const urlLoc = searchParams.get('localidad');
    const urlZona = searchParams.get('zona');

    if (urlLoc) {
      setSelectedLocalityId(urlLoc);
    } else if (urlZona) {
      // Buscar la localidad correspondiente a esa zona
      api
        .get(`/zones/${urlZona}`)
        .then((z) => {
          const locId = z.localidad?._id || z.localidad;
          if (locId) {
            setSelectedLocalityId(locId);
            setSearchParams({ localidad: locId });
          }
        })
        .catch(() => {});
    } else if (!selectedLocalityId && localities.length > 0) {
      // Por defecto seleccionar la primera localidad
      setSelectedLocalityId(localities[0]._id);
    }
  }, [searchParams, localities]);

  // 3. Cargar las hojas de ruta según la localidad seleccionada (o todas)
  useEffect(() => {
    if (!selectedLocalityId && localities.length === 0) return;

    let isMounted = true;
    setLoadingHojas(true);
    setHojasError('');

    const fetchHojas = async () => {
      try {
        if (selectedLocalityId === 'all') {
          // Obtener hoja de ruta de todas las localidades
          const results = await Promise.all(
            localities.map((loc) =>
              api.get(`/localities/${loc._id}/hoja-de-ruta`).catch(() => null)
            )
          );
          if (isMounted) {
            setHojas(results.filter(Boolean));
          }
        } else if (selectedLocalityId) {
          const res = await api.get(`/localities/${selectedLocalityId}/hoja-de-ruta`);
          if (isMounted) {
            setHojas([res]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setHojasError(err.message || 'Error al cargar la hoja de ruta');
        }
      } finally {
        if (isMounted) {
          setLoadingHojas(false);
        }
      }
    };

    fetchHojas();

    return () => {
      isMounted = false;
    };
  }, [selectedLocalityId, localities]);

  const handleLocalityChange = (e) => {
    const value = e.target.value;
    setSelectedLocalityId(value);
    if (value === 'all') {
      setSearchParams({ localidad: 'all' });
    } else if (value) {
      setSearchParams({ localidad: value });
    } else {
      setSearchParams({});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayError = hojasError || localitiesError;

  return (
    <div>
      {/* Panel de control superior (oculto en impresión) */}
      <div className="card no-print" style={{ borderRadius: 0, boxShadow: 'none' }}>
        <div className="card-header" style={{ borderRadius: 0 }}>
          <div>
            <h2 className="card-title">🚚 Hoja de Ruta para Repartidores</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Planilla de entrega clasificada por Localidad y Zona (estilo planilla/Excel)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              style={{ borderRadius: 0 }}
              onClick={handlePrint}
              disabled={loadingHojas || hojas.length === 0}
            >
              🖨️ Imprimir Hoja
            </button>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="form-group" style={{ maxWidth: '420px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="localitySelect" style={{ fontWeight: 600 }}>
              Seleccionar Localidad:
            </label>
            <select
              id="localitySelect"
              className="form-control"
              style={{ borderRadius: 0 }}
              value={selectedLocalityId}
              onChange={handleLocalityChange}
            >
              {localities.length > 1 && (
                <option value="all">Todas las localidades (Completo)</option>
              )}
              {localities.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.nombre} {loc.provincia ? `(${loc.provincia})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {displayError && (
        <div className="alert alert-danger no-print" style={{ margin: '1rem 0', borderRadius: 0 }}>
          <span>⚠️</span>
          <div>{displayError}</div>
        </div>
      )}

      {loadingHojas && (
        <div className="loading-state no-print">
          <div className="spinner"></div>
          <p>Generando planilla de hoja de ruta...</p>
        </div>
      )}

      {/* Contenido Imprimible de Hoja de Ruta */}
      {!loadingHojas && hojas.length > 0 && (
        <div className="hoja-ruta-container">
          {hojas.map((hoja, index) => (
            <div key={hoja.localidad?._id || index} className="hoja-localidad-seccion">
              {/* Encabezado por Localidad */}
              <div className="hoja-localidad-header">
                <div>
                  <span style={{ fontSize: '13pt', fontWeight: 'bold' }}>
                    Localidad: {hoja.localidad?.nombre || 'Localidad'}
                  </span>
                  {hoja.localidad?.provincia && (
                    <span style={{ fontSize: '10pt', marginLeft: '0.5rem', color: '#333333' }}>
                      ({hoja.localidad.provincia})
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '10pt' }}>
                  <span>
                    <strong>Cantidad de zonas:</strong> {hoja.cantidadZonas || 0}
                  </span>
                  <span style={{ marginLeft: '1rem' }}>
                    <strong>Total clientes:</strong> {hoja.totalClientes || 0}
                  </span>
                  <span style={{ marginLeft: '1rem', color: '#555555' }}>
                    Fecha: {new Date().toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Zonas de la Localidad */}
              {!hoja.zonas || hoja.zonas.length === 0 ? (
                <div
                  style={{
                    border: '1px solid #000000',
                    borderTop: 'none',
                    padding: '12px',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: '#444444'
                  }}
                >
                  Esta localidad no posee zonas de reparto configuradas.
                </div>
              ) : (
                hoja.zonas.map((zona) => (
                  <div key={zona._id} className="hoja-zona-bloque">
                    {/* Banda gris suave en el encabezado de zona */}
                    <div className="hoja-zona-banda">
                      <span>
                        <strong>Zona:</strong> {zona.nombre}
                        {zona.diasDeReparto && zona.diasDeReparto.length > 0 && (
                          <span style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                            — Días: {zona.diasDeReparto.join(', ')}
                          </span>
                        )}
                      </span>
                      <span>
                        <strong>Clientes:</strong> {zona.cantidadClientes || 0}
                      </span>
                    </div>

                    {/* Tabla de clientes de la zona */}
                    {!zona.clientes || zona.clientes.length === 0 ? (
                      <div
                        style={{
                          border: '1px solid #000000',
                          borderTop: 'none',
                          padding: '8px 12px',
                          fontSize: '10pt',
                          fontStyle: 'italic',
                          color: '#555555'
                        }}
                      >
                        Sin clientes activos registrados en esta zona.
                      </div>
                    ) : (
                      <table className="hoja-tabla-excel">
                        <thead>
                          <tr>
                            <th style={{ width: '32px', textAlign: 'center' }}>N°</th>
                            <th style={{ width: '190px' }}>Cliente</th>
                            <th style={{ width: '180px' }}>Dirección</th>
                            <th style={{ width: '110px' }}>Teléfono</th>
                            <th style={{ width: '60px', textAlign: 'center' }}>Envases</th>
                            <th style={{ width: '85px', textAlign: 'right' }}>Saldo</th>
                            <th>Observaciones</th>
                            <th style={{ width: '75px', textAlign: 'center' }}>Entregado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zona.clientes.map((cliente, cliIndex) => (
                            <tr key={cliente._id}>
                              <td style={{ textAlign: 'center' }}>{cliIndex + 1}</td>
                              <td>
                                <strong>{cliente.nombre}</strong>
                              </td>
                              <td>{cliente.direccion}</td>
                              <td>{cliente.telefono || '-'}</td>
                              <td style={{ textAlign: 'center' }}>
                                {cliente.envasesEnPoder || 0}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                ${Number(cliente.saldo || 0).toLocaleString('es-AR', {
                                  minimumFractionDigits: 2
                                })}
                              </td>
                              <td>{cliente.observaciones || '-'}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="checkbox-cuadrado" aria-hidden="true"></span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {!loadingHojas && hojas.length === 0 && !displayError && (
        <div className="empty-state no-print">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">No hay datos para mostrar</h3>
          <p className="empty-description">
            Seleccioná una localidad para generar su hoja de reparto.
          </p>
        </div>
      )}
    </div>
  );
};

export default HojaRutaPage;
