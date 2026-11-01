import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import ZonesPage from './pages/ZonesPage';
import LocalitiesPage from './pages/LocalitiesPage';
import ClientsPage from './pages/ClientsPage';
import HojaRutaPage from './pages/HojaRutaPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="localities" element={<LocalitiesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="hoja-de-ruta" element={<HojaRutaPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
