import React from 'react';
import { Link } from 'react-router-dom';
import EntityCrud from '../components/EntityCrud';

const LocalitiesPage = () => {
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
    }
  ];

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
    }
  ];

  return (
    <EntityCrud
      title="Localidades"
      subtitle="Ciudades y localidades integradas en los recorridos"
      endpoint="/localities"
      columns={columns}
      fields={fields}
      initialFormValues={{ nombre: '', provincia: 'Santa Fe' }}
      extraRowActions={(locality) => (
        <Link
          to={`/hoja-de-ruta?localidad=${locality._id}`}
          className="btn btn-secondary btn-sm"
          title="Ver Hoja de Ruta de esta localidad"
        >
          🚚 Hoja
        </Link>
      )}
    />
  );
};

export default LocalitiesPage;
