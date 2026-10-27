require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Zone = require('../models/zoneModel');
const Locality = require('../models/localityModel');
const Client = require('../models/clientModel');
const User = require('../models/userModel');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/distribuidora_agua';

  try {
    console.log(`Conectando a MongoDB en: ${uri}`);
    await mongoose.connect(uri);
    console.log('Conexión establecida con éxito.');

    // 1. Limpieza de colecciones existentes
    console.log('Limpiando colecciones anteriores...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Zone.deleteMany({}),
      Locality.deleteMany({}),
      Client.deleteMany({}),
      User.deleteMany({})
    ]);

    // 2. Creación del usuario administrador con create() para disparar el hook de bcrypt
    console.log('Creando usuario administrador...');
    const adminUser = await User.create({
      nombre: 'Administrador General',
      email: 'admin@aguapura.com',
      password: 'admin1234',
      rol: 'admin'
    });
    console.log(`Usuario admin creado: ${adminUser.email}`);

    // 3. Creación de Categorías (3)
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

    // 4. Creación de Productos (5 con precios realistas en ARS)
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

    // 5. Creación de Zonas (2)
    console.log('Creando zonas de reparto...');
    const zonasCreadas = await Zone.insertMany([
      {
        nombre: 'Zona Centro y Puerto',
        diasDeReparto: ['Lunes', 'Miércoles', 'Viernes']
      },
      {
        nombre: 'Zona Norte y Boulevard',
        diasDeReparto: ['Martes', 'Jueves', 'Sábado']
      }
    ]);

    const zonaCentro = zonasCreadas.find((z) => z.nombre === 'Zona Centro y Puerto');
    const zonaNorte = zonasCreadas.find((z) => z.nombre === 'Zona Norte y Boulevard');

    // 6. Creación de Localidades de Santa Fe (4 repartidas en esas zonas)
    console.log('Creando localidades...');
    const localidadesCreadas = await Locality.insertMany([
      {
        nombre: 'Santa Fe Capital',
        provincia: 'Santa Fe',
        zona: zonaCentro._id
      },
      {
        nombre: 'Santo Tomé',
        provincia: 'Santa Fe',
        zona: zonaCentro._id
      },
      {
        nombre: 'Rincón',
        provincia: 'Santa Fe',
        zona: zonaNorte._id
      },
      {
        nombre: 'Recreo',
        provincia: 'Santa Fe',
        zona: zonaNorte._id
      }
    ]);

    const locSantaFe = localidadesCreadas.find((l) => l.nombre === 'Santa Fe Capital');
    const locSantoTome = localidadesCreadas.find((l) => l.nombre === 'Santo Tomé');
    const locRincon = localidadesCreadas.find((l) => l.nombre === 'Rincón');
    const locRecreo = localidadesCreadas.find((l) => l.nombre === 'Recreo');

    // 7. Creación de Clientes (6)
    console.log('Creando clientes de ejemplo...');
    await Client.insertMany([
      {
        nombre: 'Consultorio Médico San Jerónimo',
        telefono: '342-4521890',
        direccion: 'San Jerónimo 2840',
        localidad: locSantaFe._id,
        envasesEnPoder: 4,
        saldo: 0,
        activo: true,
        observaciones: 'Entregar de 8 a 12 hs por recepción médica'
      },
      {
        nombre: 'Gimnasio Fitness Vital',
        telefono: '342-4889100',
        direccion: 'Urquiza 3150',
        localidad: locSantaFe._id,
        envasesEnPoder: 8,
        saldo: -8400,
        activo: true,
        observaciones: 'Consumo alto semanal. Tocar timbre portón lateral'
      },
      {
        nombre: 'Familia Rossi',
        telefono: '342-5123456',
        direccion: 'Av. 7 de Marzo 1420',
        localidad: locSantoTome._id,
        envasesEnPoder: 2,
        saldo: 0,
        activo: true,
        observaciones: 'Dejar bidones en la cochera si no atienden'
      },
      {
        nombre: 'Estudio Contable Méndez & Asoc.',
        telefono: '342-4987654',
        direccion: 'Centenario 2110',
        localidad: locSantoTome._id,
        envasesEnPoder: 3,
        saldo: 4200,
        activo: true,
        observaciones: 'Cuenta corriente al día'
      },
      {
        nombre: 'Complejo Turístico Los Sauces',
        telefono: '342-6311223',
        direccion: 'Ruta 1 Km 5.5',
        localidad: locRincon._id,
        envasesEnPoder: 6,
        saldo: 0,
        activo: true,
        observaciones: 'Pasa el camión los sábados a primera hora'
      },
      {
        nombre: 'Panadería La Espiga Dorada',
        telefono: '342-4912388',
        direccion: 'Av. Bartolomé Mitre 840',
        localidad: locRecreo._id,
        envasesEnPoder: 0,
        saldo: 0,
        activo: false,
        observaciones: 'Cliente en pausa temporal por remodelación'
      }
    ]);

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

module.exports = seedData;
