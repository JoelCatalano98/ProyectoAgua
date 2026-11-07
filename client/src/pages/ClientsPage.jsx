import React, { useState, useEffect } from 'react';
import EntityCrud from '../components/EntityCrud';
import QuickLocalityModal from '../components/QuickLocalityModal';
import QuickZoneModal from '../components/QuickZoneModal';
import api from '../api/client';
import { useFetch } from '../hooks/useFetch';

const ClientsPage = () => {
  const [isQuickLocalityOpen, setIsQuickLocalityOpen] = useState(false);
  const [isQuickZoneOpen, setIsQuickZoneOpen] = useState(false);
  const [activeZoneModalData, setActiveZoneModalData] = useState({ id: '', nombre: '' });
  const [fieldChangeCallback, setFieldChangeCallback] = useState(null);

  // Carga inicial de datos de referencia (Localidades y Zonas)
  const { data: referencesData, error: referencesError, refetch: refetchReferences } = useFetch(
    () => Promise.all([api.get('/localities'), api.get('/zones')]),
    [],
    [[], []]
  );

  const [localitiesData, zonesData] = Array.isArray(referencesData) ? referencesData : [[], []];
  const [localities, setLocalities] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (Array.isArray(localitiesData)) {
      setLocalities(localitiesData);
    }
  }, [localitiesData]);

  useEffect(() => {
    if (Array.isArray(zonesData)) {
      setZones(zonesData);
    }
  }, [zonesData]);

  // Manejo de modal rápida de Localidad
  const handleOpenQuickLocality = (handleFieldChange) => {
    setFieldChangeCallback(() => handleFieldChange);
    setIsQuickLocalityOpen(true);
  };

  const handleLocalityCreated = (newLoc) => {
    setLocalities((prev) => {
      const exists = prev.some((l) => l._id === newLoc._id);
      return exists ? prev : [...prev, newLoc].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    if (fieldChangeCallback) {
      fieldChangeCallback('localidad', newLoc._id);
      fieldChangeCallback('zona', '');
    }
    refetchReferences();
  };

  // Manejo de modal rápida de Zona
  const handleOpenQuickZone = (formData, handleFieldChange) => {
    if (!formData.localidad) return;
    const loc = localities.find((l) => l._id === formData.localidad);
    setActiveZoneModalData({
      id: formData.localidad,
      nombre: loc ? loc.nombre : 'Localidad seleccionada'
    });
    setFieldChangeCallback(() => handleFieldChange);
    setIsQuickZoneOpen(true);
  };

  const handleZoneCreated = (newZone) => {
    setZones((prev) => {
      const exists = prev.some((z) => z._id === newZone._id);
      return exists ? prev : [...prev, newZone].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    if (fieldChangeCallback) {
      fieldChangeCallback('zona', newZone._id);
    }
    refetchReferences();
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Cliente / Razón Social',
      render: (row) => (
        <div>
          <strong>{row.nombre}</strong>
          {row.telefono && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              📞 {row.telefono}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (row) => row.direccion
    },
    {
      key: 'localidad',
      label: 'Localidad',
      render: (row) => {
        const locNombre = row.zona?.localidad?.nombre;
        return locNombre ? (
          <span style={{ fontWeight: 600 }}>{locNombre}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>-</span>
        );
      }
    },
    {
      key: 'zona',
      label: 'Zona de Reparto',
      render: (row) =>
        row.zona?.nombre ? (
          <span className="badge badge-primary">{row.zona.nombre}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Sin zona</span>
        )
    },
    {
      key: 'envasesEnPoder',
      label: 'Bidones',
      render: (row) => (
        <span className="badge badge-neutral">💧 {row.envasesEnPoder || 0}</span>
      )
    },
    {
      key: 'saldo',
      label: 'Saldo (ARS)',
      render: (row) => {
        const saldo = Number(row.saldo || 0);
        const color = saldo < 0 ? 'var(--danger)' : saldo > 0 ? 'var(--success)' : 'inherit';
        return (
          <span style={{ fontWeight: 600, color }}>
            ${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        );
      }
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (row) => (
        <span className={`badge ${row.activo ? 'badge-success' : 'badge-danger'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  const localityOptions = localities.map((l) => ({
    value: l._id,
    label: l.nombre
  }));

  const fields = [
    {
      name: 'nombre',
      label: 'Nombre Completo / Razón Social',
      type: 'text',
      required: true,
      placeholder: 'Ej: Consultorio San Jerónimo, Familia Rossi...'
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'text',
      required: false,
      placeholder: 'Ej: 342-4521890'
    },
    {
      name: 'direccion',
      label: 'Dirección de Entrega',
      type: 'text',
      required: true,
      placeholder: 'Calle, número y piso/depto'
    },
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
      onChange: (newLocId, { handleFieldChange }) => {
        handleFieldChange('localidad', newLocId);
        handleFieldChange('zona', '');
      }
    },
    {
      name: 'zona',
      label: 'Zona',
      type: 'select',
      required: true,
      placeholder: 'Seleccione una zona...',
      disabled: (form) => !form.localidad,
      options: (form) => {
        if (!form.localidad) return [];
        return zones
          .filter((z) => (z.localidad?._id || z.localidad) === form.localidad)
          .map((z) => ({ value: z._id, label: z.nombre }));
      },
      action: ({ formData, handleFieldChange }) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 0 }}
          disabled={!formData.localidad}
          onClick={() => handleOpenQuickZone(formData, handleFieldChange)}
          title="Crear nueva zona para esta localidad"
        >
          + Nueva zona
        </button>
      ),
      warning: (form) => {
        if (!form.localidad) {
          return 'Primero seleccioná una localidad para ver sus zonas';
        }
        const matchingZones = zones.filter(
          (z) => (z.localidad?._id || z.localidad) === form.localidad
        );
        if (matchingZones.length === 0) {
          return (
            <span>
              ⚠️ Esta localidad no tiene zonas.{' '}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 0, padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}
                onClick={() => handleOpenQuickZone(form, fieldChangeCallback)}
              >
                + Nueva zona
              </button>
            </span>
          );
        }
        return null;
      }
    },
    {
      name: 'envasesEnPoder',
      label: 'Envases en Poder (Comodato)',
      type: 'number',
      min: 0,
      required: false,
      placeholder: '0'
    },
    {
      name: 'saldo',
      label: 'Saldo Inicial / Actual ($ ARS)',
      type: 'number',
      step: 'any',
      required: false,
      placeholder: '0.00'
    },
    {
      name: 'activo',
      label: 'Cliente Activo en Rutas de Reparto',
      type: 'checkbox'
    },
    {
      name: 'observaciones',
      label: 'Observaciones de Entrega',
      type: 'textarea',
      required: false,
      placeholder: 'Horarios de atención, referencias del timbre o cochera...'
    }
  ];

  const filters = [
    {
      name: 'localidad',
      label: 'Filtrar por Localidad',
      placeholder: 'Todas las localidades',
      options: localityOptions
    },
    {
      name: 'zona',
      label: 'Filtrar por Zona',
      placeholder: 'Todas las zonas',
      options: zones.map((z) => ({
        value: z._id,
        label: `${z.nombre} (${z.localidad?.nombre || 'Zona'})`
      }))
    },
    {
      name: 'activo',
      label: 'Estado Comercial',
      placeholder: 'Todos los estados',
      options: [
        { value: 'true', label: 'Solo Clientes Activos' },
        { value: 'false', label: 'Solo Inactivos' }
      ]
    }
  ];

  return (
    <div>
      {referencesError && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <div>Error al cargar referencias de clientes: {referencesError}</div>
        </div>
      )}

      <EntityCrud
        title="Clientes"
        subtitle="Padrón comercial de clientes clasificados por localidad y zona"
        endpoint="/clients"
        columns={columns}
        fields={fields}
        filters={filters}
        initialFormValues={{
          nombre: '',
          telefono: '',
          direccion: '',
          localidad: '',
          zona: '',
          envasesEnPoder: 0,
          saldo: 0,
          activo: true,
          observaciones: ''
        }}
        onTransformInitial={(item) => ({
          ...item,
          localidad: item.zona?.localidad?._id || item.zona?.localidad || '',
          zona: item.zona?._id || item.zona || ''
        })}
        onTransformSubmit={(data) => {
          // Extraemos localidad para no enviarla al backend (cliente solo guarda zona)
          const { localidad, ...clientPayload } = data;
          return {
            ...clientPayload,
            envasesEnPoder: Number(clientPayload.envasesEnPoder || 0),
            saldo: Number(clientPayload.saldo || 0),
            activo: Boolean(clientPayload.activo)
          };
        }}
      />

      <QuickLocalityModal
        isOpen={isQuickLocalityOpen}
        onClose={() => setIsQuickLocalityOpen(false)}
        onCreated={handleLocalityCreated}
      />

      <QuickZoneModal
        isOpen={isQuickZoneOpen}
        onClose={() => setIsQuickZoneOpen(false)}
        localidadId={activeZoneModalData.id}
        localidadNombre={activeZoneModalData.nombre}
        onCreated={handleZoneCreated}
      />
    </div>
  );
};

export default ClientsPage;
