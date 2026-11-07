const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Locality = require('../models/localityModel');
const Zone = require('../models/zoneModel');
const Client = require('../models/clientModel');
const User = require('../models/userModel');
const Settings = require('../models/settingsModel');

const getMongoTarget = (uri) => {
  try {
    const parsed = new URL(uri);
    const host = parsed.host || 'desconocido';
    const dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : '';
    const isRemote = parsed.protocol === 'mongodb+srv:' || parsed.hostname.includes('mongodb.net');
    return { host, dbName, isRemote };
  } catch {
    const isRemote = uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
    const withoutCreds = uri.replace(/^mongodb(\+srv)?:\/\/[^@]+@/, '');
    const hostMatch = withoutCreds.match(/^([^/?]+)/);
    const dbMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
    return {
      host: hostMatch ? hostMatch[1] : 'desconocido',
      dbName: dbMatch ? dbMatch[1] : '',
      isRemote
    };
  }
};

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';
  const { host, dbName, isRemote } = getMongoTarget(uri);

  console.log('=== INICIO DEL SEED DE BASE DE DATOS ===');
  console.log(`Destino: Host: ${host} | Base de datos: ${dbName || '(por defecto)'}`);
  console.log('Operación planificada:');
  console.log('  - Vaciado total de colecciones existentes: categories, products, localities, zones, clients, users, settings.');
  console.log('  - Creación de configuración comercial (Settings).');
  console.log('  - Creación de usuario administrador inicial.');
  console.log('  - Poblado de catálogo: 3 categorías y 5 productos.');
  console.log('  - Poblado logístico: 4 localidades y 5 zonas de reparto.');
  console.log('  - Alta de 6 clientes asociados a zonas.');

  // Protección de seguridad
  if (isRemote) {
    throw new Error('ABORTADO POR SEGURIDAD: No se puede ejecutar el seed sobre MongoDB Atlas / producción.');
  }
  if (dbName.endsWith('_test')) {
    throw new Error(`ABORTADO POR SEGURIDAD: El seed de desarrollo no debe ejecutarse sobre la base de tests ('${dbName}').`);
  }

  try {
    console.log(`Conectando a MongoDB en host ${host} (base: ${dbName || 'default'})...`);
    await mongoose.connect(uri);
    console.log('Conexión establecida con éxito.');

    // 1. Limpieza de colecciones existentes
    console.log('Limpiando colecciones anteriores...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Locality.deleteMany({}),
      Zone.deleteMany({}),
      Client.deleteMany({}),
      User.deleteMany({}),
      Settings.deleteMany({})
    ]);

    // 2. Creación del documento de configuración (Settings)
    console.log('Creando configuración inicial de la empresa...');
    const settings = await Settings.create({
      nombreEmpresa: 'Mi Empresa de Agua'
    });
    console.log(`Configuración creada: ${settings.nombreEmpresa}`);

    // 3. Creación del usuario administrador
    console.log('Creando usuario administrador...');
    const adminUser = await User.create({
      nombre: 'Administrador General',
      email: 'admin@aguapura.com',
      password: 'admin1234',
      rol: 'admin',
      activo: true
    });
    console.log(`Usuario admin creado: ${adminUser.email}`);

    // 4. Creación de Categorías (3)
    console.log('Creando categorías...');
    const categoriasCreadas = await Category.insertMany([
      {
        nombre: 'Bidones',
        descripcion: 'Envases retornables y descartables de agua purificada de máxima calidad'
      },
      {
        nombre: 'Dispensers',
        descripcion: 'Equipos dispensadores frío-calor y dispensers naturales de sobremesa'
      },
      {
        nombre: 'Servicios',
        descripcion: 'Mantenimiento preventivo, higienización periódica y alquiler de equipos'
      }
    ]);

    const catBidones = categoriasCreadas.find((c) => c.nombre === 'Bidones');
    const catDispensers = categoriasCreadas.find((c) => c.nombre === 'Dispensers');
    const catServicios = categoriasCreadas.find((c) => c.nombre === 'Servicios');

    // 5. Creación de Productos (5 con precios realistas en ARS)
    console.log('Creando productos...');
    await Product.insertMany([
      {
        nombre: 'Bidón 20 Litros Retornable',
        descripcion: 'Agua purificada baja en sodio en envase retornable de policarbonato',
        precio: 4200,
        stock: 450,
        categoria: catBidones._id
      },
      {
        nombre: 'Bidón 12 Litros Retornable',
        descripcion: 'Agua purificada formato compacto familiar',
        precio: 3100,
        stock: 220,
        categoria: catBidones._id
      },
      {
        nombre: 'Dispenser Frío-Calor de Pie',
        descripcion: 'Equipo con compresor de alta eficiencia energética y display digital',
        precio: 145000,
        stock: 18,
        categoria: catDispensers._id
      },
      {
        nombre: 'Dispenser Natural de Mesa',
        descripcion: 'Soporte con canilla vertedora apto para bidones de 12L y 20L',
        precio: 18500,
        stock: 65,
        categoria: catDispensers._id
      },
      {
        nombre: 'Abono Alquiler y Sanitización Mensual',
        descripcion: 'Servicio mensual que incluye mantenimiento preventivo y limpieza con ozono',
        precio: 12000,
        stock: 999,
        categoria: catServicios._id
      }
    ]);

    // 6. Creación de Localidades (4)
    console.log('Creando localidades...');
    const localidadesCreadas = await Locality.insertMany([
      {
        nombre: 'Santa Fe Capital',
        provincia: 'Santa Fe'
      },
      {
        nombre: 'Santo Tomé',
        provincia: 'Santa Fe'
      },
      {
        nombre: 'Rincón',
        provincia: 'Santa Fe'
      },
      {
        nombre: 'Recreo',
        provincia: 'Santa Fe'
      }
    ]);

    const locSantaFe = localidadesCreadas.find((l) => l.nombre === 'Santa Fe Capital');
    const locSantoTome = localidadesCreadas.find((l) => l.nombre === 'Santo Tomé');
    const locRincon = localidadesCreadas.find((l) => l.nombre === 'Rincón');
    const locRecreo = localidadesCreadas.find((l) => l.nombre === 'Recreo');

    // 7. Creación de Zonas pertenecientes a cada localidad (Jerarquía: Localidad -> Zona)
    console.log('Creando zonas de reparto por localidad...');
    const zonasCreadas = await Zone.insertMany([
      {
        nombre: 'Zona Centro y Puerto',
        localidad: locSantaFe._id,
        diasDeReparto: ['Lunes', 'Miércoles', 'Viernes']
      },
      {
        nombre: 'Zona Norte y Boulevard',
        localidad: locSantaFe._id,
        diasDeReparto: ['Martes', 'Jueves', 'Sábado']
      },
      {
        nombre: 'Zona Centro',
        localidad: locSantoTome._id,
        diasDeReparto: ['Lunes', 'Miércoles']
      },
      {
        nombre: 'Zona Ruta 1',
        localidad: locRincon._id,
        diasDeReparto: ['Sábado']
      },
      {
        nombre: 'Zona Casco Urbano',
        localidad: locRecreo._id,
        diasDeReparto: ['Martes', 'Jueves']
      }
    ]);

    const zonaCentroSantaFe = zonasCreadas.find((z) => z.nombre === 'Zona Centro y Puerto');
    const zonaNorteSantaFe = zonasCreadas.find((z) => z.nombre === 'Zona Norte y Boulevard');
    const zonaSantoTome = zonasCreadas.find((z) => z.nombre === 'Zona Centro');
    const zonaRincon = zonasCreadas.find((z) => z.nombre === 'Zona Ruta 1');
    const zonaRecreo = zonasCreadas.find((z) => z.nombre === 'Zona Casco Urbano');

    // 8. Creación de Clientes asociados a su Zona (Jerarquía: Zona -> Cliente)
    console.log('Creando clientes de ejemplo...');
    await Client.insertMany([
      {
        nombre: 'Consultorio Médico San Jerónimo',
        telefono: '342-4521890',
        direccion: 'San Jerónimo 2840',
        zona: zonaCentroSantaFe._id,
        envasesEnPoder: 4,
        saldo: 0,
        activo: true,
        observaciones: 'Entregar de 8 a 12 hs por recepción médica'
      },
      {
        nombre: 'Gimnasio Fitness Vital',
        telefono: '342-4889100',
        direccion: 'Urquiza 3150',
        zona: zonaNorteSantaFe._id,
        envasesEnPoder: 8,
        saldo: -8400,
        activo: true,
        observaciones: 'Consumo alto semanal. Tocar timbre portón lateral'
      },
      {
        nombre: 'Familia Rossi',
        telefono: '342-5123456',
        direccion: 'Av. 7 de Marzo 1420',
        zona: zonaSantoTome._id,
        envasesEnPoder: 2,
        saldo: 0,
        activo: true,
        observaciones: 'Dejar bidones en la cochera si no atienden'
      },
      {
        nombre: 'Estudio Contable Méndez & Asoc.',
        telefono: '342-4987654',
        direccion: 'Centenario 2110',
        zona: zonaSantoTome._id,
        envasesEnPoder: 3,
        saldo: 4200,
        activo: true,
        observaciones: 'Cuenta corriente al día'
      },
      {
        nombre: 'Complejo Turístico Los Sauces',
        telefono: '342-6311223',
        direccion: 'Ruta 1 Km 5.5',
        zona: zonaRincon._id,
        envasesEnPoder: 6,
        saldo: 0,
        activo: true,
        observaciones: 'Pasa el camión los sábados a primera hora'
      },
      {
        nombre: 'Panadería La Espiga Dorada',
        telefono: '342-4912388',
        direccion: 'Av. Bartolomé Mitre 840',
        zona: zonaRecreo._id,
        envasesEnPoder: 0,
        saldo: 0,
        activo: false,
        observaciones: 'Cliente en pausa temporal por remodelación'
      }
    ]);

    console.log('=== RESUMEN DE EJECUCIÓN DEL SEED ===');
    console.log(`Destino: Host: ${host} | Base de datos: ${dbName || '(por defecto)'}`);
    console.log('Resultado: Se vaciaron 7 colecciones y se crearon 1 config, 1 admin, 3 categorías, 5 productos, 4 localidades, 5 zonas y 6 clientes.');
    console.log('¡Poblado de datos iniciales (Seed) completado con éxito!');
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Conexión con MongoDB cerrada.');
  }
};

if (require.main === module) {
  seedData();
}

seedData.getMongoTarget = getMongoTarget;
module.exports = seedData;
module.exports.seedData = seedData;
module.exports.getMongoTarget = getMongoTarget;
