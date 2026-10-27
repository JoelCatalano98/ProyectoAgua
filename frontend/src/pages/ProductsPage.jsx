import React, { useState, useEffect } from 'react';
import EntityCrud from '../components/EntityCrud';
import api from '../api/client';

const ProductsPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const columns = [
    {
      key: 'nombre',
      label: 'Producto / Servicio',
      render: (row) => <strong>{row.nombre}</strong>
    },
    {
      key: 'categoria',
      label: 'Categoría',
      render: (row) =>
        row.categoria?.nombre ? (
          <span className="badge badge-primary">{row.categoria.nombre}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Sin categoría</span>
        )
    },
    {
      key: 'precio',
      label: 'Precio (ARS)',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          ${Number(row.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => (
        <span className={`badge ${row.stock > 10 ? 'badge-success' : 'badge-danger'}`}>
          {row.stock} un.
        </span>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (row) => row.descripcion || <span style={{ color: 'var(--text-muted)' }}>-</span>
    }
  ];

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.nombre }));

  const fields = [
    {
      name: 'nombre',
      label: 'Nombre del Producto',
      type: 'text',
      required: true,
      placeholder: 'Ej: Bidón 20L Retornable, Dispenser...'
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      required: true,
      placeholder: 'Seleccione una categoría...',
      options: categoryOptions
    },
    {
      name: 'precio',
      label: 'Precio ($ ARS)',
      type: 'number',
      min: 0,
      step: 'any',
      required: true,
      placeholder: '0.00'
    },
    {
      name: 'stock',
      label: 'Stock Inicial',
      type: 'number',
      min: 0,
      required: false,
      placeholder: '0'
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      required: false,
      placeholder: 'Detalles del envase, características del dispenser...'
    }
  ];

  const filters = [
    {
      name: 'categoria',
      label: 'Filtrar por Categoría',
      placeholder: 'Todas las categorías',
      options: categoryOptions
    }
  ];

  return (
    <EntityCrud
      title="Productos & Servicios"
      subtitle="Catálogo de envases, dispensers y abonos mensuales"
      endpoint="/products"
      columns={columns}
      fields={fields}
      filters={filters}
      initialFormValues={{ nombre: '', categoria: '', precio: '', stock: 0, descripcion: '' }}
      onTransformInitial={(item) => ({
        ...item,
        categoria: item.categoria?._id || item.categoria || ''
      })}
      onTransformSubmit={(data) => ({
        ...data,
        precio: Number(data.precio),
        stock: Number(data.stock || 0)
      })}
    />
  );
};

export default ProductsPage;
