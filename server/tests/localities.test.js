const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createLocality, createZone, createClient } = require('./helpers/factories');

describe('Endpoints de Localidades (/api/localities)', () => {
  let adminToken;
  let authHeaders;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    const admin = await createAdminAndGetToken();
    adminToken = admin.token;
    authHeaders = admin.headers;
  });

  describe('POST /api/localities - Crear localidad', () => {
    it('debe crear una localidad exitosamente con datos válidos (201)', async () => {
      const payload = {
        nombre: 'San José del Rincón',
        provincia: 'Santa Fe'
      };

      const res = await request(app)
        .post('/api/localities')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.provincia).toBe(payload.provincia);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('debe devolver 400 cuando el nombre está vacío', async () => {
      const payload = {
        nombre: '   ',
        provincia: 'Santa Fe'
      };

      const res = await request(app)
        .post('/api/localities')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({ campo: 'nombre' })
          ])
        })
      );
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const res = await request(app)
        .post('/api/localities')
        .send({
          nombre: 'Recreo Sur'
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/token no proporcionado/i)
        })
      );
    });
  });

  describe('DELETE /api/localities/:id - Regla de borrado con zonas', () => {
    it('debe devolver 409 cuando se intenta eliminar una localidad con zonas vinculadas', async () => {
      const locality = await createLocality({ nombre: 'Sauce Viejo' });
      await createZone(locality._id, { nombre: 'Zona Costera' });

      const res = await request(app)
        .delete(`/api/localities/${locality._id}`)
        .set(authHeaders);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/no se puede eliminar la localidad porque tiene.*zona/i)
        })
      );
    });

    it('debe eliminar la localidad correctamente si no tiene zonas asociadas (200)', async () => {
      const locality = await createLocality({ nombre: 'Localidad Libre' });

      const res = await request(app)
        .delete(`/api/localities/${locality._id}`)
        .set(authHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', locality._id.toString());
    });
  });

  describe('GET /api/localities/:id/hoja-de-ruta - Hoja de ruta por localidad', () => {
    it('debe devolver la estructura anidada y ordenada por zona y por dirección', async () => {
      const locality = await createLocality({ nombre: 'Santa Fe Capital' });

      // Dos zonas para la localidad (orden alfabético: Zona Centro, Zona Norte)
      const zonaNorte = await createZone(locality._id, {
        nombre: 'Zona Norte',
        diasDeReparto: ['Martes', 'Jueves']
      });
      const zonaCentro = await createZone(locality._id, {
        nombre: 'Zona Centro',
        diasDeReparto: ['Lunes', 'Miércoles']
      });

      // Clientes en Zona Centro con diferentes direcciones (deben quedar ordenados alfabéticamente)
      await createClient(zonaCentro._id, {
        nombre: 'Cliente B',
        direccion: 'San Martín 1500',
        activo: true
      });
      await createClient(zonaCentro._id, {
        nombre: 'Cliente A',
        direccion: '25 de Mayo 1200',
        activo: true
      });

      // Clientes en Zona Norte
      await createClient(zonaNorte._id, {
        nombre: 'Cliente C',
        direccion: 'Aristóbulo del Valle 5000',
        activo: true
      });
      // Cliente inactivo (no debe aparecer en la hoja de reparto activa)
      await createClient(zonaNorte._id, {
        nombre: 'Cliente Inactivo',
        direccion: 'Bv. Pellegrini 2800',
        activo: false
      });

      const res = await request(app)
        .get(`/api/localities/${locality._id}/hoja-de-ruta`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('localidad');
      expect(res.body.localidad.nombre).toBe('Santa Fe Capital');
      expect(res.body.cantidadZonas).toBe(2);
      expect(res.body.totalClientes).toBe(3); // Solo activos

      // Las zonas deben estar ordenadas por nombre: Zona Centro, luego Zona Norte
      expect(res.body.zonas).toHaveLength(2);
      expect(res.body.zonas[0].nombre).toBe('Zona Centro');
      expect(res.body.zonas[0].cantidadClientes).toBe(2);
      expect(res.body.zonas[1].nombre).toBe('Zona Norte');
      expect(res.body.zonas[1].cantidadClientes).toBe(1);

      // Dentro de Zona Centro, clientes ordenados por dirección: '25 de Mayo' antes que 'San Martín'
      expect(res.body.zonas[0].clientes[0].direccion).toBe('25 de Mayo 1200');
      expect(res.body.zonas[0].clientes[1].direccion).toBe('San Martín 1500');
    });

    it('debe devolver hoja de ruta vacía cuando la localidad no tiene zonas', async () => {
      const locality = await createLocality({ nombre: 'Localidad Desierta' });

      const res = await request(app)
        .get(`/api/localities/${locality._id}/hoja-de-ruta`);

      expect(res.status).toBe(200);
      expect(res.body.cantidadZonas).toBe(0);
      expect(res.body.totalClientes).toBe(0);
      expect(res.body.zonas).toEqual([]);
    });

    it('debe devolver 404 si la localidad no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/localities/${fakeId}/hoja-de-ruta`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toMatch(/localidad no encontrada/i);
    });

    it('debe devolver 400 si el ID es un ObjectId inválido', async () => {
      const res = await request(app)
        .get('/api/localities/invalido-123/hoja-de-ruta');

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });
});
