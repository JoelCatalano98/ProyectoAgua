const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createLocality, createZone, createClient } = require('./helpers/factories');

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
    it('debe crear un cliente exitosamente con zona y localidad anidada populadas (201)', async () => {
      const locality = await createLocality({ nombre: 'Santa Fe Capital' });
      const zone = await createZone(locality._id, { nombre: 'Zona Centro' });

      const payload = {
        nombre: 'Sanatorio Central',
        telefono: '342-4567890',
        direccion: 'Rivadavia 2500',
        zona: zone._id.toString(),
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

      // Verificación de población anidada: cliente -> zona -> localidad
      expect(res.body.zona).toBeDefined();
      expect(typeof res.body.zona).toBe('object');
      expect(res.body.zona._id.toString()).toBe(zone._id.toString());
      expect(res.body.zona.nombre).toBe('Zona Centro');

      expect(res.body.zona.localidad).toBeDefined();
      expect(typeof res.body.zona.localidad).toBe('object');
      expect(res.body.zona.localidad._id.toString()).toBe(locality._id.toString());
      expect(res.body.zona.localidad.nombre).toBe('Santa Fe Capital');
    });

    it('debe devolver 400 cuando faltan campos requeridos (nombre o dirección)', async () => {
      const zone = await createZone();

      const payload = {
        telefono: '342-1111111',
        zona: zone._id.toString()
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

    it('debe devolver 400 cuando falta el campo zona', async () => {
      const payload = {
        nombre: 'Cliente Sin Zona',
        direccion: 'San Martín 1000'
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
            expect.objectContaining({ campo: 'zona' })
          ])
        })
      );
    });

    it('debe devolver 400 cuando la zona especificada no existe en la base de datos', async () => {
      const fakeZoneId = new mongoose.Types.ObjectId().toString();

      const payload = {
        nombre: 'Cliente Zona Inexistente',
        direccion: 'Belgrano 100',
        zona: fakeZoneId
      };

      const res = await request(app)
        .post('/api/clients')
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

    it('debe devolver 400 cuando el id de zona tiene formato inválido', async () => {
      const payload = {
        nombre: 'Cliente Zona Inválida',
        direccion: 'Belgrano 100',
        zona: 'zona-invalida'
      };

      const res = await request(app)
        .post('/api/clients')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const zone = await createZone();

      const payload = {
        nombre: 'Cliente Sin Token',
        direccion: 'Urquiza 500',
        zona: zone._id.toString()
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

  describe('GET /api/clients - Filtros y listados', () => {
    it('debe filtrar clientes por localidad a través de sus zonas', async () => {
      const locSantaFe = await createLocality({ nombre: 'Santa Fe' });
      const locSantoTome = await createLocality({ nombre: 'Santo Tomé' });

      const zoneSF = await createZone(locSantaFe._id, { nombre: 'Zona SF' });
      const zoneST = await createZone(locSantoTome._id, { nombre: 'Zona ST' });

      await createClient(zoneSF._id, { nombre: 'Cliente Santa Fe' });
      await createClient(zoneST._id, { nombre: 'Cliente Santo Tomé' });

      const res = await request(app)
        .get(`/api/clients?localidad=${locSantaFe._id}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].nombre).toBe('Cliente Santa Fe');
      expect(res.body[0].zona.localidad._id.toString()).toBe(locSantaFe._id.toString());
    });
  });
});
