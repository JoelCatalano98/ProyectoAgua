import React from 'react';
import EntityCrud from '../components/EntityCrud';

const CategoriesPage = () => {
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre de Categoría',
      render: (row) => <strong>{row.nombre}</strong>
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (row) => row.descripcion || <span style={{ color: 'var(--text-muted)' }}>Sin descripción</span>
    },
    {
      key: 'createdAt',
      label: 'Fecha Alta',
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-AR') : '-'
    }
  ];

  const fields = [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ej: Bidones, Dispensers, Servicios...'
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      placeholder: 'Detalles y características de la categoría...'
    }
  ];

  return (
    <EntityCrud
      title="Categorías"
      subtitle="Clasificación de productos y servicios ofrecidos"
      endpoint="/categories"
      columns={columns}
      fields={fields}
      initialFormValues={{ nombre: '', descripcion: '' }}
    />
  );
};

export default CategoriesPage;
