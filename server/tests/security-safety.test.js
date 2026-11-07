const { validateTestDatabase } = require('./helpers/dbHelper');
const { validateEnv } = require('../src/config/envValidator');
const { validateSeedConfig, getMongoTarget } = require('../src/utils/seed');

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

describe('Validación de JWT_SECRET en Entorno de Producción y Desarrollo', () => {
  it('debe abortar si JWT_SECRET no está configurado (en cualquier entorno)', () => {
    expect(() => {
      validateEnv({ NODE_ENV: 'production', JWT_SECRET: '' });
    }).toThrow(/JWT_SECRET es obligatoria/i);

    expect(() => {
      validateEnv({ NODE_ENV: 'development', JWT_SECRET: '   ' });
    }).toThrow(/JWT_SECRET es obligatoria/i);
  });

  it('debe abortar en producción si JWT_SECRET es el valor de ejemplo', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'tu_clave_secreta_jwt_aqui'
      });
    }).toThrow(/no puede ser un valor de ejemplo/i);
  });

  it('debe abortar en producción si JWT_SECRET tiene menos de 32 caracteres', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'clave_corta_de_20_ch'
      });
    }).toThrow(/debe contener al menos 32 caracteres/i);
  });

  it('debe permitir el arranque en producción si JWT_SECRET es robusto (>= 32 caracteres no ejemplo)', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'esta_es_una_clave_super_segura_de_mas_de_32_caracteres_2026'
      });
    }).not.toThrow();
  });

  it('debe permitir claves breves en entorno de desarrollo o pruebas', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'development',
        JWT_SECRET: 'clave_corta_dev'
      });
    }).not.toThrow();

    expect(() => {
      validateEnv({
        NODE_ENV: 'test',
        JWT_SECRET: 'test_secret'
      });
    }).not.toThrow();
  });
});

describe('Protección del Seed para Bases de Datos Remotas (MongoDB Atlas) y Locales', () => {
  const atlasUri = 'mongodb+srv://admin:miSuperPassword@cluster0.abcde.mongodb.net/distribuidora_agua?retryWrites=true&w=majority';
  const localUri = 'mongodb://127.0.0.1:27017/distribuidora_agua';

  it('debe extraer host y dbName sin exponer credenciales de la URI', () => {
    const target = getMongoTarget(atlasUri);
    expect(target.host).toBe('cluster0.abcde.mongodb.net');
    expect(target.dbName).toBe('distribuidora_agua');
    expect(target.isRemote).toBe(true);
    expect(JSON.stringify(target)).not.toContain('admin');
    expect(JSON.stringify(target)).not.toContain('miSuperPassword');
  });

  it('debe abortar con error claro si la URI es remota (Atlas) y SEED_CONFIRM no es "yes"', () => {
    expect(() => {
      validateSeedConfig({ uri: atlasUri, seedConfirm: undefined });
    }).toThrow(/SEED_CONFIRM=yes/i);

    expect(() => {
      validateSeedConfig({ uri: atlasUri, seedConfirm: 'no' });
    }).toThrow(/SEED_CONFIRM=yes/i);
  });

  it('debe permitir la ejecución en base local sin requerir SEED_CONFIRM', () => {
    expect(() => {
      validateSeedConfig({ uri: localUri, seedConfirm: undefined });
    }).not.toThrow();
  });

  it('debe abortar si el nombre de la base de datos termina en _test', () => {
    expect(() => {
      validateSeedConfig({ uri: 'mongodb://127.0.0.1:27017/distribuidora_agua_test' });
    }).toThrow(/base de tests/i);
  });

  it('debe permitir la ejecución sobre Atlas cuando SEED_CONFIRM="yes"', () => {
    expect(() => {
      validateSeedConfig({ uri: atlasUri, seedConfirm: 'yes' });
    }).not.toThrow();
  });
});
