const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers/dbHelper');
const { createAdminAndGetToken, createRepartidorAndGetToken } = require('./helpers/authHelper');
const { createUser, createSettings } = require('./helpers/factories');

describe('Endpoints de Usuarios y Configuración (/api/users y /api/settings)', () => {
  let adminToken;
  let adminHeaders;
  let repartidorToken;
  let repartidorHeaders;

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
    adminHeaders = admin.headers;

    const repartidor = await createRepartidorAndGetToken();
    repartidorToken = repartidor.token;
    repartidorHeaders = repartidor.headers;
  });

  describe('POST /api/users - Creación de usuarios y control de acceso', () => {
    it('debe crear un usuario exitosamente como admin sin devolver el password (201)', async () => {
      const payload = {
        nombre: 'Nuevo Operador',
        email: 'nuevo_operador@aguapura.com',
        password: 'claveSegura123',
        rol: 'repartidor',
        activo: true
      };

      const res = await request(app)
        .post('/api/users')
        .set(adminHeaders)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.nombre).toBe(payload.nombre);
      expect(res.body.email).toBe(payload.email);
      expect(res.body.rol).toBe(payload.rol);
      expect(res.body.activo).toBe(true);

      // Verificación crítica: La contraseña NUNCA debe devolverse
      expect(res.body.password).toBeUndefined();
    });

    it('debe devolver 403 cuando un repartidor intenta crear un usuario', async () => {
      const payload = {
        nombre: 'Usuario No Permitido',
        email: 'intento@aguapura.com',
        password: 'password123',
        rol: 'repartidor'
      };

      const res = await request(app)
        .post('/api/users')
        .set(repartidorHeaders)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/permisos insuficientes|acceso denegado/i)
        })
      );
    });

    it('debe devolver 401 al intentar crear un usuario sin token', async () => {
      const payload = {
        nombre: 'Usuario Anónimo',
        email: 'anonimo@aguapura.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users')
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

  describe('POST /api/users/login - Autenticación', () => {
    it('debe iniciar sesión correctamente con credenciales válidas (200)', async () => {
      await createUser({
        email: 'login_valido@aguapura.com',
        password: 'password123',
        activo: true
      });

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login_valido@aguapura.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('login_valido@aguapura.com');
      // La contraseña nunca se expone en la respuesta de login
      expect(res.body.user.password).toBeUndefined();
    });

    it('debe devolver 401 con credenciales inválidas ante contraseña incorrecta', async () => {
      await createUser({
        email: 'login_pass_error@aguapura.com',
        password: 'passwordCorrecta',
        activo: true
      });

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login_pass_error@aguapura.com',
          password: 'passwordIncorrecta'
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: 'Credenciales inválidas'
        })
      );
    });

    it('debe devolver 401 con el mismo mensaje genérico ante un usuario inactivo', async () => {
      await createUser({
        email: 'usuario_inactivo@aguapura.com',
        password: 'password123',
        activo: false
      });

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'usuario_inactivo@aguapura.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: 'Credenciales inválidas'
        })
      );
    });
  });

  describe('Endpoints de Configuración (/api/settings)', () => {
    it('debe obtener la configuración pública sin requerir token (200)', async () => {
      await createSettings({ nombreEmpresa: 'Aguas del Centro' });

      const res = await request(app).get('/api/settings/public');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nombreEmpresa', 'Aguas del Centro');
    });

    it('debe devolver 401 al intentar modificar la configuración sin token', async () => {
      const res = await request(app)
        .put('/api/settings')
        .send({ nombreEmpresa: 'Nuevo Nombre Sin Auth' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/token no proporcionado/i)
        })
      );
    });

    it('debe devolver 403 al intentar modificar la configuración con token de repartidor', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set(repartidorHeaders)
        .send({ nombreEmpresa: 'Nuevo Nombre Repartidor' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: false,
          message: expect.stringMatching(/permisos insuficientes|acceso denegado/i)
        })
      );
    });

    it('debe permitir modificar la configuración como admin (200)', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set(adminHeaders)
        .send({ nombreEmpresa: 'Aguas del Litoral S.A.' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nombreEmpresa', 'Aguas del Litoral S.A.');

      // Comprobar que el endpoint público ahora refleja el cambio
      const publicRes = await request(app).get('/api/settings/public');
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.nombreEmpresa).toBe('Aguas del Litoral S.A.');
    });
  });
});
