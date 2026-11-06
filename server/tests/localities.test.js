const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createZone, createLocality, createClient } = require('./helpers/factories');

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
    it('debe crear una localidad exitosamente con la zona populada (201)', async () => {
      const zone = await createZone({ nombre: 'Zona Costera' });

      const payload = {
        nombre: 'San José del Rincón',
        provincia: 'Santa Fe',
        zona: zone._id.toString()
      };

      const res = await request(app)
        .post('/api/localities')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.provincia).toBe(payload.provincia);
      // Verificación de población de la zona
      expect(res.body.zona).toBeDefined();
      expect(typeof res.body.zona).toBe('object');
      expect(res.body.zona._id.toString()).toBe(zone._id.toString());
      expect(res.body.zona.nombre).toBe(zone.nombre);
    });

    it('debe devolver 400 cuando la zona no existe en la base de datos', async () => {
      const fakeZoneId = new mongoose.Types.ObjectId().toString();

      const payload = {
        nombre: 'Localidad Fantasma',
        provincia: 'Santa Fe',
        zona: fakeZoneId
      };

      const res = await request(app)
        .post('/api/localities')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/zona.*no existe/i)
        })
      );
    });

    it('debe devolver 400 cuando se envía un ObjectId de zona con formato inválido', async () => {
      const payload = {
        nombre: 'Localidad Error',
        zona: 'zona-invalida-123'
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
            expect.objectContaining({
              campo: 'zona'
            })
          ])
        })
      );
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const zone = await createZone();

      const res = await request(app)
        .post('/api/localities')
        .send({
          nombre: 'Recreo Sur',
          zona: zone._id.toString()
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

  describe('DELETE /api/localities/:id - Regla de borrado con clientes', () => {
    it('debe devolver 409 cuando se intenta eliminar una localidad con clientes asociados', async () => {
      const zone = await createZone();
      const locality = await createLocality(zone._id, { nombre: 'Sauce Viejo' });
      await createClient(locality._id, { nombre: 'Cliente Test' });

      const res = await request(app)
        .delete(`/api/localities/${locality._id}`)
        .set(authHeaders);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/no se puede eliminar.*cliente/i)
        })
      );
    });
  });
});
