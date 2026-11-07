const { validateTestDatabase } = require('./helpers/dbHelper');

describe('Seguridad de Entorno de Pruebas (Protección de Base de Datos)', () => {
  it('debe abortar con error si la URI es de MongoDB Atlas (mongodb+srv)', () => {
    expect(() => {
      validateTestDatabase('mongodb+srv://admin:pass@cluster0.mongodb.net/distribuidora_agua_test');
    }).toThrow(/Atlas \(mongodb\+srv\)/i);
  });

  it('debe abortar con error si el nombre de la base de datos no termina en _test', () => {
    expect(() => {
      validateTestDatabase('mongodb://127.0.0.1:27017/distribuidora_agua');
    }).toThrow(/debe terminar obligatoriamente en '_test'/i);
  });

  it('debe abortar con error si la base de datos es de producción sin sufijo _test', () => {
    expect(() => {
      validateTestDatabase('mongodb://127.0.0.1:27017/produccion');
    }).toThrow(/debe terminar obligatoriamente en '_test'/i);
  });

  it('debe permitir la conexión cuando la URI es local y la base termina en _test', () => {
    expect(() => {
      validateTestDatabase('mongodb://127.0.0.1:27017/distribuidora_agua_test');
    }).not.toThrow();
  });
});
