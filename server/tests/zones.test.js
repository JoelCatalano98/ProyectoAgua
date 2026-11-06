const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createZone, createLocality } = require('./helpers/factories');

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
    it('debe crear una zona exitosamente con datos válidos (201)', async () => {
      const payload = {
        nombre: 'Zona Sur y Costanera',
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
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('debe devolver 400 cuando se envía un día fuera del enum permitido', async () => {
      const payload = {
        nombre: 'Zona Rural',
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

    it('debe devolver 409 con nombre de zona duplicado', async () => {
      await createZone({ nombre: 'Zona Centro' });

      const res = await request(app)
        .post('/api/zones')
        .set(authHeaders)
        .send({
          nombre: 'Zona Centro',
          diasDeReparto: ['Martes', 'Jueves']
        });

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/ya existe|duplicad/i)
        })
      );
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const res = await request(app)
        .post('/api/zones')
        .send({
          nombre: 'Zona Oeste',
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

  describe('DELETE /api/zones/:id - Regla de borrado con localidades', () => {
    it('debe devolver 409 cuando se intenta eliminar una zona con localidades vinculadas', async () => {
      const zone = await createZone({ nombre: 'Zona Metropolitana' });
      await createLocality(zone._id, { nombre: 'Santo Tomé' });

      const res = await request(app)
        .delete(`/api/zones/${zone._id}`)
        .set(authHeaders);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/no se puede eliminar.*localidad/i)
        })
      );
    });
  });
});
