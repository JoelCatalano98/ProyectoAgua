const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createZone, createLocality } = require('./helpers/factories');

describe('Endpoints de Clientes (/api/clients)', () => {
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

  describe('POST /api/clients - Crear cliente', () => {
    it('debe crear un cliente exitosamente con localidad y zona anidada populadas (201)', async () => {
      const zone = await createZone({ nombre: 'Zona Centro' });
      const locality = await createLocality(zone._id, { nombre: 'Santa Fe Capital' });

      const payload = {
        nombre: 'Sanatorio Central',
        telefono: '342-4567890',
        direccion: 'Rivadavia 2500',
        localidad: locality._id.toString(),
        envasesEnPoder: 4,
        saldo: 0,
        activo: true,
        observaciones: 'Recepción 24hs'
      };

      const res = await request(app)
        .post('/api/clients')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.direccion).toBe(payload.direccion);

      // Verificación de población anidada: cliente -> localidad -> zona
      expect(res.body.localidad).toBeDefined();
      expect(typeof res.body.localidad).toBe('object');
      expect(res.body.localidad._id.toString()).toBe(locality._id.toString());
      expect(res.body.localidad.nombre).toBe(locality.nombre);

      expect(res.body.localidad.zona).toBeDefined();
      expect(typeof res.body.localidad.zona).toBe('object');
      expect(res.body.localidad.zona._id.toString()).toBe(zone._id.toString());
      expect(res.body.localidad.zona.nombre).toBe(zone.nombre);
    });

    it('debe devolver 400 cuando faltan campos requeridos (nombre o dirección)', async () => {
      const zone = await createZone();
      const locality = await createLocality(zone._id);

      const payload = {
        telefono: '342-1111111',
        localidad: locality._id.toString()
        // Faltan nombre y dirección
      };

      const res = await request(app)
        .post('/api/clients')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({ campo: 'nombre' }),
            expect.objectContaining({ campo: 'direccion' })
          ])
        })
      );
    });

    it('debe devolver 400 cuando la localidad especificada no existe en la base de datos', async () => {
      const fakeLocalityId = new mongoose.Types.ObjectId().toString();

      const payload = {
        nombre: 'Cliente Localidad Inexistente',
        direccion: 'Belgrano 100',
        localidad: fakeLocalityId
      };

      const res = await request(app)
        .post('/api/clients')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/localidad.*no existe/i)
        })
      );
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const zone = await createZone();
      const locality = await createLocality(zone._id);

      const payload = {
        nombre: 'Cliente Sin Token',
        direccion: 'Urquiza 500',
        localidad: locality._id.toString()
      };

      const res = await request(app)
        .post('/api/clients')
        .send(payload);

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/token no proporcionado/i)
        })
      );
    });
  });
});
