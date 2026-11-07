import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EntityCrud from '../components/EntityCrud';
import QuickLocalityModal from '../components/QuickLocalityModal';
import { useFetch } from '../hooks/useFetch';

const ZonesPage = () => {
  const [isQuickLocalityOpen, setIsQuickLocalityOpen] = useState(false);
  const [fieldChangeCallback, setFieldChangeCallback] = useState(null);

  // Carga de localidades para el select y filtros
  const { data: localitiesData, error: localitiesError, refetch: refetchLocalities } = useFetch(
    '/localities',
    [],
    []
  );
  const [localities, setLocalities] = useState([]);

  // Mantener lista local sincronizada con useFetch o nuevas altas
  React.useEffect(() => {
    if (Array.isArray(localitiesData)) {
      setLocalities(localitiesData);
    }
  }, [localitiesData]);

  const localityOptions = localities.map((l) => ({
    value: l._id,
    label: l.provincia ? `${l.nombre} (${l.provincia})` : l.nombre
  }));

  const handleOpenQuickLocality = (handleFieldChange) => {
    setFieldChangeCallback(() => handleFieldChange);
    setIsQuickLocalityOpen(true);
  };

  const handleLocalityCreated = (newLocality) => {
    setLocalities((prev) => {
      const exists = prev.some((l) => l._id === newLocality._id);
      return exists ? prev : [...prev, newLocality].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    if (fieldChangeCallback) {
      fieldChangeCallback('localidad', newLocality._id);
    }
    refetchLocalities();
  };

  const columns = [
    {
      key: 'localidad',
      label: 'Localidad',
      render: (row) =>
        row.localidad?.nombre ? (
          <span style={{ fontWeight: 600 }}>{row.localidad.nombre}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Sin localidad</span>
        )
    },
    {
      key: 'nombre',
      label: 'Nombre de la Zona',
      render: (row) => <strong>{row.nombre}</strong>
    },
    {
      key: 'diasDeReparto',
      label: 'Días de Reparto',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {row.diasDeReparto && row.diasDeReparto.length > 0 ? (
            row.diasDeReparto.map((dia) => (
              <span key={dia} className="badge badge-primary">
                {dia}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Sin días asignados</span>
          )}
        </div>
      )
    }
  ];

  const fields = [
    {
      name: 'localidad',
      label: 'Localidad',
      type: 'select',
      required: true,
      placeholder: 'Seleccione una localidad...',
      options: localityOptions,
      action: ({ handleFieldChange }) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 0 }}
          onClick={() => handleOpenQuickLocality(handleFieldChange)}
          title="Crear nueva localidad rápidamente"
        >
          + Nueva localidad
        </button>
      ),
      warning:
        localities.length === 0 ? (
          <span>
            ⚠️ Primero creá una localidad.{' '}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 0, padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}
              onClick={() => handleOpenQuickLocality(fieldChangeCallback)}
            >
              + Nueva localidad
            </button>
          </span>
        ) : null
    },
    {
      name: 'nombre',
      label: 'Nombre de Zona',
      type: 'text',
      required: true,
      placeholder: 'Ej: Zona Centro, Zona Norte...'
    },
    {
      name: 'diasDeReparto',
      label: 'Días de Reparto (Lunes a Sábado)',
      type: 'days',
      required: false
    }
  ];

  const filters = [
    {
      name: 'localidad',
      label: 'Filtrar por Localidad',
      placeholder: 'Todas las localidades',
      options: localityOptions
    }
  ];

  return (
    <div>
      {localitiesError && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <div>Error al cargar localidades: {localitiesError}</div>
        </div>
      )}

      <EntityCrud
        title="Zonas de Reparto"
        subtitle="Definición de circuitos logísticos por localidad y días de atención"
        endpoint="/zones"
        columns={columns}
        fields={fields}
        filters={filters}
        initialFormValues={{ localidad: '', nombre: '', diasDeReparto: [] }}
        onTransformInitial={(item) => ({
          ...item,
          localidad: item.localidad?._id || item.localidad || ''
        })}
        extraRowActions={(zone) => {
          const locId = zone.localidad?._id || zone.localidad;
          return locId ? (
            <Link
              to={`/hoja-de-ruta?localidad=${locId}`}
              className="btn btn-secondary btn-sm"
              title="Ver Hoja de Ruta de la localidad"
            >
              🚚 Hoja
            </Link>
          ) : null;
        }}
      />

      <QuickLocalityModal
        isOpen={isQuickLocalityOpen}
        onClose={() => setIsQuickLocalityOpen(false)}
        onCreated={handleLocalityCreated}
      />
    </div>
  );
};

export default ZonesPage;
