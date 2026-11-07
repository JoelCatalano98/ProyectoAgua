const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createZone, createLocality, createClient } = require('./helpers/factories');

describe('Endpoints de Zonas (/api/zones)', () => {
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

  describe('POST /api/zones - Crear zona', () => {
    it('debe crear una zona exitosamente con datos válidos y localidad populada (201)', async () => {
      const locality = await createLocality({ nombre: 'Santa Fe Capital' });

      const payload = {
        nombre: 'Zona Sur y Costanera',
        localidad: locality._id.toString(),
        diasDeReparto: ['Lunes', 'Miércoles', 'Viernes']
      };

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.diasDeReparto).toEqual(payload.diasDeReparto);
      expect(res.body.localidad).toBeDefined();
      expect(res.body.localidad._id.toString()).toBe(locality._id.toString());
      expect(res.body.localidad.nombre).toBe('Santa Fe Capital');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('debe devolver 400 cuando se envía un día fuera del enum permitido', async () => {
      const locality = await createLocality();

      const payload = {
        nombre: 'Zona Rural',
        localidad: locality._id.toString(),
        diasDeReparto: ['Domingo']
      };

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: expect.stringMatching(/diasDeReparto/i)
            })
          ])
        })
      );
    });

    it('debe devolver 400 cuando falta la localidad', async () => {
      const payload = {
        nombre: 'Zona Sin Localidad',
        diasDeReparto: ['Lunes']
      };

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({ campo: 'localidad' })
          ])
        })
      );
    });

    it('debe devolver 400 cuando la localidad no existe en la base de datos', async () => {
      const fakeLocId = new mongoose.Types.ObjectId().toString();

      const payload = {
        nombre: 'Zona Fantasma',
        localidad: fakeLocId,
        diasDeReparto: ['Lunes']
      };

      const res = await request(app)
        .post('/api/zones')
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

    it('debe devolver 400 cuando el id de localidad tiene formato inválido', async () => {
      const payload = {
        nombre: 'Zona Invalida',
        localidad: 'localidad-id-invalido',
        diasDeReparto: ['Lunes']
      };

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it('debe devolver 409 con nombre de zona duplicado dentro de la misma localidad', async () => {
      const locality = await createLocality();
      await createZone(locality._id, { nombre: 'Zona Centro' });

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send({
          nombre: 'Zona Centro',
          localidad: locality._id.toString(),
          diasDeReparto: ['Martes', 'Jueves']
        });

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/ya existe una zona con ese nombre/i)
        })
      );
    });

    it('debe permitir crear zonas con el mismo nombre en diferentes localidades (201)', async () => {
      const loc1 = await createLocality({ nombre: 'Santa Fe Capital' });
      const loc2 = await createLocality({ nombre: 'Santo Tomé' });

      await createZone(loc1._id, { nombre: 'Zona Centro' });

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send({
          nombre: 'Zona Centro',
          localidad: loc2._id.toString(),
          diasDeReparto: ['Lunes']
        });

      expect(res.status).toBe(201);
      expect(res.body.nombre).toBe('Zona Centro');
      expect(res.body.localidad._id.toString()).toBe(loc2._id.toString());
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const locality = await createLocality();
      const res = await request(app)
        .post('/api/zones')
        .send({
          nombre: 'Zona Oeste',
          localidad: locality._id.toString(),
          diasDeReparto: ['Lunes']
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

  describe('GET /api/zones?localidad=<id> - Filtrar zonas por localidad', () => {
    it('debe devolver únicamente las zonas pertenecientes a la localidad especificada', async () => {
      const loc1 = await createLocality({ nombre: 'Locality A' });
      const loc2 = await createLocality({ nombre: 'Locality B' });

      const z1 = await createZone(loc1._id, { nombre: 'Zona A1' });
      const z2 = await createZone(loc1._id, { nombre: 'Zona A2' });
      const z3 = await createZone(loc2._id, { nombre: 'Zona B1' });

      const res = await request(app)
        .get(`/api/zones?localidad=${loc1._id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      const nombres = res.body.map((z) => z.nombre);
      expect(nombres).toContain('Zona A1');
      expect(nombres).toContain('Zona A2');
      expect(nombres).not.toContain('Zona B1');
    });
  });

  describe('DELETE /api/zones/:id - Regla de borrado con clientes', () => {
    it('debe devolver 409 cuando se intenta eliminar una zona con clientes asociados', async () => {
      const locality = await createLocality();
      const zone = await createZone(locality._id, { nombre: 'Zona Con Clientes' });
      await createClient(zone._id, { nombre: 'Cliente de Prueba' });

      const res = await request(app)
        .delete(`/api/zones/${zone._id}`)
        .set(authHeaders);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/no se puede eliminar la zona porque tiene.*cliente/i)
        })
      );
    });

    it('debe eliminar la zona correctamente si no tiene clientes asociados (200)', async () => {
      const locality = await createLocality();
      const zone = await createZone(locality._id, { nombre: 'Zona Sin Clientes' });

      const res = await request(app)
        .delete(`/api/zones/${zone._id}`)
        .set(authHeaders);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', zone._id.toString());
    });
  });
});
