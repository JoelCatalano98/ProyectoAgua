import React, { useState, useEffect } from 'react';
import EntityCrud from '../components/EntityCrud';
import api from '../api/client';

const LocalitiesPage = () => {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    api.get('/zones')
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => setZones([]));
  }, []);

  const columns = [
    {
      key: 'nombre',
      label: 'Localidad / Ciudad',
      render: (row) => <strong>{row.nombre}</strong>
    },
    {
      key: 'provincia',
      label: 'Provincia',
      render: (row) => row.provincia || 'Santa Fe'
    },
    {
      key: 'zona',
      label: 'Zona Asignada',
      render: (row) =>
        row.zona?.nombre ? (
          <span className="badge badge-primary">{row.zona.nombre}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Sin zona</span>
        )
    }
  ];

  const zoneOptions = zones.map((z) => ({ value: z._id, label: z.nombre }));

  const fields = [
    {
      name: 'nombre',
      label: 'Nombre de la Localidad',
      type: 'text',
      required: true,
      placeholder: 'Ej: Santa Fe Capital, Santo Tomé...'
    },
    {
      name: 'provincia',
      label: 'Provincia',
      type: 'text',
      required: true,
      placeholder: 'Santa Fe'
    },
    {
      name: 'zona',
      label: 'Zona Logística',
      type: 'select',
      required: true,
      placeholder: 'Seleccione una zona...',
      options: zoneOptions
    }
  ];

  const filters = [
    {
      name: 'zona',
      label: 'Filtrar por Zona',
      placeholder: 'Todas las zonas',
      options: zoneOptions
    }
  ];

  return (
    <EntityCrud
      title="Localidades"
      subtitle="Ciudades y localidades integradas en los recorridos"
      endpoint="/localities"
      columns={columns}
      fields={fields}
      filters={filters}
      initialFormValues={{ nombre: '', provincia: 'Santa Fe', zona: '' }}
      onTransformInitial={(item) => ({
        ...item,
        zona: item.zona?._id || item.zona || ''
      })}
    />
  );
};

export default LocalitiesPage;
