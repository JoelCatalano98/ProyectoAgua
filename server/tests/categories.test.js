const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createCategory, createProduct } = require('./helpers/factories');

describe('Endpoints de Categorías (/api/categories)', () => {
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

  describe('POST /api/categories - Crear categoría', () => {
    it('debe crear una categoría exitosamente con datos válidos (201)', async () => {
      const payload = {
        nombre: 'Bidones Retornables',
        descripcion: 'Envases de 12L y 20L purificados'
      };

      const res = await request(app)
        .post('/api/categories')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.descripcion).toBe(payload.descripcion);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('debe devolver 400 con nombre vacío', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeaders)
        .send({ nombre: '   ', descripcion: 'Descripción' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nombre'
            })
          ])
        })
      );
    });

    it('debe devolver 400 con nombre faltante', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeaders)
        .send({ descripcion: 'Solo descripción sin nombre' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nombre'
            })
          ])
        })
      );
    });

    it('debe devolver 409 con nombre duplicado', async () => {
      await createCategory({ nombre: 'Dispensers' });

      const res = await request(app)
        .post('/api/categories')
        .set(authHeaders)
        .send({ nombre: 'Dispensers', descripcion: 'Duplicado' });

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
        .post('/api/categories')
        .send({ nombre: 'Accesorios', descripcion: 'Sin token' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/token no proporcionado/i)
        })
      );
    });
  });

  describe('DELETE /api/categories/:id - Regla de borrado con productos', () => {
    it('debe devolver 409 cuando se intenta eliminar una categoría con productos asociados', async () => {
      const category = await createCategory({ nombre: 'Aguas' });
      await createProduct(category._id, { nombre: 'Agua con Gas 500ml' });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set(authHeaders);

      expect(res.status).toBe(409);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/no se puede eliminar.*producto/i)
        })
      );
    });
  });
});
