import React, { useState, useEffect } from 'react';
import EntityCrud from '../components/EntityCrud';
import api from '../api/client';

const ClientsPage = () => {
  const [localities, setLocalities] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/localities').catch(() => []),
      api.get('/zones').catch(() => [])
    ]).then(([locData, zoneData]) => {
      setLocalities(Array.isArray(locData) ? locData : []);
      setZones(Array.isArray(zoneData) ? zoneData : []);
    });
  }, []);

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
      label: 'Localidad y Zona',
      render: (row) => (
        <div>
          <div>{row.localidad?.nombre || '-'}</div>
          {row.localidad?.zona?.nombre && (
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {row.localidad.zona.nombre}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'envasesEnPoder',
      label: 'Bidones',
      render: (row) => (
        <span className="badge badge-neutral">
          💧 {row.envasesEnPoder || 0}
        </span>
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
    label: `${l.nombre} (${l.zona?.nombre || 'Sin zona'})`
  }));

  const zoneOptions = zones.map((z) => ({
    value: z._id,
    label: z.nombre
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
      options: localityOptions
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
      name: 'zona',
      label: 'Filtrar por Zona',
      placeholder: 'Todas las zonas',
      options: zoneOptions
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
    <EntityCrud
      title="Clientes"
      subtitle="Padrón comercial de clientes particulares y corporativos"
      endpoint="/clients"
      columns={columns}
      fields={fields}
      filters={filters}
      initialFormValues={{
        nombre: '',
        telefono: '',
        direccion: '',
        localidad: '',
        envasesEnPoder: 0,
        saldo: 0,
        activo: true,
        observaciones: ''
      }}
      onTransformInitial={(item) => ({
        ...item,
        localidad: item.localidad?._id || item.localidad || ''
      })}
      onTransformSubmit={(data) => ({
        ...data,
        envasesEnPoder: Number(data.envasesEnPoder || 0),
        saldo: Number(data.saldo || 0),
        activo: Boolean(data.activo)
      })}
    />
  );
};

export default ClientsPage;
