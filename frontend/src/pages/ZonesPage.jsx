import React from 'react';
import { Link } from 'react-router-dom';
import EntityCrud from '../components/EntityCrud';

const ZonesPage = () => {
  const columns = [
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

  return (
    <EntityCrud
      title="Zonas de Reparto"
      subtitle="Definición de circuitos logísticos y días de atención"
      endpoint="/zones"
      columns={columns}
      fields={fields}
      initialFormValues={{ nombre: '', diasDeReparto: [] }}
      extraRowActions={(zone) => (
        <Link
          to={`/hoja-de-ruta?zona=${zone._id}`}
          className="btn btn-secondary btn-sm"
          title="Ver Hoja de Ruta"
        >
          🚚 Hoja
        </Link>
      )}
    />
  );
};

export default ZonesPage;
