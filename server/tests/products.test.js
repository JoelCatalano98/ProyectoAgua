const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken } = require('./helpers/authHelper');
const { createCategory } = require('./helpers/factories');

describe('Endpoints de Productos (/api/products)', () => {
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

  describe('POST /api/products - Crear producto', () => {
    it('debe crear un producto exitosamente con la categoría populada (201)', async () => {
      const category = await createCategory({ nombre: 'Bidones Retornables' });

      const payload = {
        nombre: 'Bidón 20 Litros Clásico',
        descripcion: 'Agua purificada baja en sodio en envase retornable',
        precio: 4200,
        stock: 150,
        categoria: category._id.toString()
      };

      const res = await request(app)
        .post('/api/products')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.precio).toBe(payload.precio);
      expect(res.body.stock).toBe(payload.stock);
      // Verificación de población de categoría
      expect(res.body.categoria).toBeDefined();
      expect(typeof res.body.categoria).toBe('object');
      expect(res.body.categoria._id.toString()).toBe(category._id.toString());
      expect(res.body.categoria.nombre).toBe(category.nombre);
    });

    it('debe devolver 400 cuando el precio es negativo', async () => {
      const category = await createCategory();

      const payload = {
        nombre: 'Producto Precio Inválido',
        precio: -150,
        stock: 10,
        categoria: category._id.toString()
      };

      const res = await request(app)
        .post('/api/products')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.any(String),
          detalles: expect.arrayContaining([
            expect.objectContaining({
              campo: 'precio'
            })
          ])
        })
      );
    });

    it('debe devolver 400 cuando la categoría no existe en la base de datos', async () => {
      const fakeCategoryId = new mongoose.Types.ObjectId().toString();

      const payload = {
        nombre: 'Producto Sin Categoría',
        precio: 3000,
        stock: 25,
        categoria: fakeCategoryId
      };

      const res = await request(app)
        .post('/api/products')
        .set(authHeaders)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/categoría.*no existe/i)
        })
      );
    });

    it('debe devolver 401 sin token de autenticación', async () => {
      const category = await createCategory();

      const payload = {
        nombre: 'Producto Anónimo',
        precio: 1500,
        stock: 5,
        categoria: category._id.toString()
      };

      const res = await request(app)
        .post('/api/products')
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
