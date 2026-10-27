# Sistema de Gestión de Reparto de Agua (Bidones y Dispensers) - Proyecto Final UTN BA

API RESTful desarrollada con Node.js, Express y MongoDB (Mongoose) aplicando arquitectura por capas con separación estricta de controladores y capa de servicios, complementada con un panel de administración web responsive desarrollado en React + Vite.

El sistema representa la Fase 1 del ciclo de vida operativo de una distribuidora de agua purificada, contemplando la gestión integral del catálogo de productos y servicios (bidones retornables, equipos dispensers frío/calor, sanitizaciones), delimitación geográfica por zonas de reparto y días de atención, localidades atendidas, cartera de clientes con control de envases y saldos, y autenticación segura para administradores y repartidores.

**Autor:** Joel Catalano

---

## 2. Esquema de la Base de Datos

### Relaciones entre entidades
- **Category (1) ── (N) Product**: Cada producto o servicio pertenece obligatoriamente a una categoría. No se permite eliminar una categoría con productos asignados.
- **Zone (1) ── (N) Locality**: Cada localidad pertenece obligatoriamente a una zona de distribución. No se permite eliminar una zona con localidades vinculadas.
- **Locality (1) ── (N) Client**: Cada cliente se encuentra radicado en una localidad. No se permite eliminar una localidad con clientes activos o registrados.

### Tabla de campos por colección

#### Colección: `categories`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único del documento |
| `nombre` | String | Sí | Sí | Nombre de la categoría (ej: Bidones, Dispensers) |
| `descripcion` | String | No | No | Detalle del tipo de producto o servicio |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `products`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único del producto |
| `nombre` | String | Sí | No | Nombre del producto o servicio ofrecido |
| `descripcion` | String | No | No | Características técnicas o especificaciones |
| `precio` | Number | Sí | No | Precio en pesos argentinos (>= 0) |
| `stock` | Number | No (def. 0) | No | Unidades disponibles en almacén (>= 0) |
| `categoria` | ObjectId (ref Category) | Sí | No (Index) | Referencia indexada a la categoría |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `zones`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único de la zona |
| `nombre` | String | Sí | Sí | Nombre representativo de la zona de reparto |
| `diasDeReparto`| Array de Strings | No | No | Días asignados para visitas (Lunes a Sábado) |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `localities`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único de la localidad |
| `nombre` | String | Sí | No | Nombre de la localidad o ciudad |
| `provincia` | String | No (def. 'Santa Fe') | No | Jurisdicción provincial |
| `zona` | ObjectId (ref Zone) | Sí | No (Index) | Referencia indexada a la zona logística |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `clients`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador del cliente |
| `nombre` | String | Sí | No | Razón social o nombre del particular |
| `telefono` | String | No | No | Teléfono de contacto |
| `direccion` | String | Sí | No | Dirección de entrega y facturación |
| `localidad` | ObjectId (ref Locality) | Sí | No (Index) | Referencia indexada a la localidad |
| `envasesEnPoder` | Number | No (def. 0) | No | Cantidad de bidones en comodato (>= 0) |
| `saldo` | Number | No (def. 0) | No | Balance de cuenta corriente (positivo o negativo) |
| `activo` | Boolean | No (def. true) | No | Estado comercial (activo/pausado) |
| `observaciones`| String | No | No | Instrucciones especiales de entrega o cobro |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `users`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador del usuario |
| `nombre` | String | No | No | Nombre del operador |
| `email` | String | Sí | Sí | Correo electrónico con validación de formato |
| `password` | String | Sí | No | Hash de contraseña con bcrypt (select: false) |
| `rol` | String | Sí (def. 'repartidor') | No | Enum: `'admin'` o `'repartidor'` |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

---

## 3. Tecnologías Utilizadas

- **Backend:**
  - **Node.js** (Entorno de ejecución de JavaScript del lado del servidor)
  - **Express 4** (Framework HTTP y enrutamiento minimalista)
  - **MongoDB** (Base de datos documental NoSQL)
  - **Mongoose 8** (Modelado de datos ODM, esquemas con validaciones y hooks asincrónicos)
  - **JSON Web Token (jsonwebtoken)** (Autenticación sin estado mediante tokens firmados)
  - **bcrypt** (Hasheo salteado y verificación unidireccional de contraseñas)
  - **CORS** (Control de acceso HTTP entre orígenes)
  - **dotenv** (Carga de variables de entorno desde archivo `.env`)

- **Frontend:**
  - **React 18** (Biblioteca para interfaces de usuario declarativas basadas en componentes)
  - **Vite 6** (Herramienta de desarrollo y empaquetador ultrarrápido)
  - **React Router 7** (Enrutamiento del lado del cliente con navegación declarativa)
  - **CSS3 Moderno Puro** (Mobile-first, Flexbox, CSS Grid, variables CSS, vistas adaptables sin librerías pesadas)

---

## 4. Instrucciones para Correr el Proyecto

### Requisitos previos
- Node.js instalado (versión 18 o superior).
- Instancia de MongoDB accesible (servicio local en `127.0.0.1:27017`, Docker o MongoDB Atlas).

### Paso a paso Backend
1. Clonar el repositorio y ubicarse en la raíz del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd proyecto-crud-mongodb
   ```
2. Instalar las dependencias del backend:
   ```bash
   npm install
   ```
3. Revisar el archivo `.env` en la raíz (ya incluido con valores funcionales por defecto):
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/distribuidora_agua
   JWT_SECRET=supersecretjwtkey_utn_proyecto_2026
   JWT_EXPIRES_IN=2h
   ```
4. Poblar la base de datos con los datos iniciales y el usuario administrador:
   ```bash
   npm run seed
   ```
5. Iniciar la API REST:
   - Modo producción: `npm start`
   - Modo desarrollo con recarga automática: `npm run dev`
   - El servidor estará disponible en `http://localhost:3000`.

### Paso a paso Frontend
1. Abrir una nueva terminal y navegar a la carpeta `frontend/`:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias del frontend:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador la URL indicada (habitualmente `http://localhost:5173`).
5. Ingresar con las credenciales del usuario semilla:
   - **Email:** `admin@aguapura.com`
   - **Contraseña:** `admin1234`

---

## 5. Listado Completo de Endpoints

### Tabla de Códigos HTTP de Respuesta
| Código | Significado | Escenario de uso |
|---|---|---|
| `200 OK` | Éxito en la consulta, modificación o baja | Búsquedas, lecturas individuales, PUT y DELETE exitosos |
| `201 Created` | Creación exitosa de recurso | POST exitoso en usuarios, productos, zonas, localidades, etc. |
| `400 Bad Request` | Error en la solicitud o regla de negocio | Faltan campos requeridos, formato inválido, referencias inexistentes o bloqueo por registros dependientes |
| `401 Unauthorized` | Fallo de autenticación | Token ausente, token expirado, token alterado o credenciales de login incorrectas |
| `404 Not Found` | Recurso no encontrado | Documento inexistente o ruta/endpoint no mapeado |
| `500 Internal Error` | Error de servidor no controlado | Fallo no previsto capturado por el middleware global |

### Endpoints de la API

| Método | Ruta | Descripción | Requiere Auth (JWT) |
|---|---|---|---|
| `POST` | `/api/users/register` | Registro de nuevos usuarios operadores | No |
| `POST` | `/api/users/login` | Autenticación de usuario. Devuelve JWT y perfil | No |
| `GET` | `/api/categories` | Listado ordenado de todas las categorías | No |
| `GET` | `/api/categories/:id` | Detalle de una categoría por su ID | No |
| `POST` | `/api/categories` | Alta de nueva categoría | Sí |
| `PUT` | `/api/categories/:id` | Modificación de datos de categoría | Sí |
| `DELETE` | `/api/categories/:id` | Eliminación de categoría (valida que no tenga productos) | Sí |
| `GET` | `/api/products` | Listado de productos (admite filtro `?categoria=`) | No |
| `GET` | `/api/products/:id` | Detalle de un producto con categoría poblada | No |
| `POST` | `/api/products` | Alta de producto (valida existencia de categoría) | Sí |
| `PUT` | `/api/products/:id` | Actualización parcial de producto | Sí |
| `DELETE` | `/api/products/:id` | Eliminación de producto | Sí |
| `GET` | `/api/zones` | Listado de zonas con días de reparto | No |
| `GET` | `/api/zones/:id` | Detalle de una zona logística | No |
| `GET` | `/api/zones/:id/hoja-de-ruta` | Clientes activos de la zona ordenados por localidad y calle | No |
| `POST` | `/api/zones` | Alta de nueva zona logística | Sí |
| `PUT` | `/api/zones/:id` | Actualización de zona y días de atención | Sí |
| `DELETE` | `/api/zones/:id` | Eliminación de zona (valida que no tenga localidades) | Sí |
| `GET` | `/api/localities` | Listado de localidades con zona poblada (filtro `?zona=`) | No |
| `GET` | `/api/localities/:id` | Detalle de localidad con zona poblada | No |
| `POST` | `/api/localities` | Alta de localidad (valida existencia de la zona) | Sí |
| `PUT` | `/api/localities/:id` | Modificación parcial de localidad | Sí |
| `DELETE` | `/api/localities/:id` | Eliminación de localidad (valida que no tenga clientes) | Sí |
| `GET` | `/api/clients` | Listado con localidad y zona pobladas (`?zona=`, `?localidad=`, `?activo=`) | No |
| `GET` | `/api/clients/:id` | Detalle de cliente con localidad y zona anidadas | No |
| `POST` | `/api/clients` | Alta de cliente (valida existencia de localidad) | Sí |
| `PUT` | `/api/clients/:id` | Modificación parcial de cliente | Sí |
| `DELETE` | `/api/clients/:id` | Eliminación de cliente | Sí |

---

## 6. Ejemplos de Datos Mock en JSON para Solicitudes y Respuestas

### Autenticación y Usuarios

#### POST `/api/users/login`
- **Request (Éxito):**
  ```json
  {
    "email": "admin@aguapura.com",
    "password": "admin1234"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "67be89b52044b7d1420cf123",
      "nombre": "Administrador General",
      "email": "admin@aguapura.com",
      "rol": "admin"
    }
  }
  ```
- **Response `401 Unauthorized` (Credenciales erróneas o email inexistente):**
  ```json
  {
    "status": "error",
    "statusCode": 401,
    "message": "Credenciales inválidas",
    "error": "Credenciales inválidas"
  }
  ```

#### POST `/api/users/register`
- **Request:**
  ```json
  {
    "nombre": "Carlos Repartidor",
    "email": "carlos@aguapura.com",
    "password": "repartidor123",
    "rol": "repartidor"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "status": "success",
    "message": "Usuario registrado exitosamente",
    "user": {
      "_id": "67be89b52044b7d1420cf124",
      "nombre": "Carlos Repartidor",
      "email": "carlos@aguapura.com",
      "rol": "repartidor",
      "createdAt": "2026-10-27T23:00:00.000Z",
      "updatedAt": "2026-10-27T23:00:00.000Z"
    }
  }
  ```

### Categorías

#### GET `/api/categories`
- **Response `200 OK`:**
  ```json
  [
    {
      "_id": "67be89b52044b7d1420cf111",
      "nombre": "Bidones",
      "descripcion": "Envases retornables y descartables de agua purificada de máxima calidad",
      "createdAt": "2026-10-27T23:00:00.000Z",
      "updatedAt": "2026-10-27T23:00:00.000Z"
    }
  ]
  ```

#### DELETE `/api/categories/:id`
- **Response `400 Bad Request` (Violación de regla de negocio: tiene productos vinculados):**
  ```json
  {
    "status": "error",
    "statusCode": 400,
    "message": "No se puede eliminar la categoría porque tiene 2 producto(s) asociado(s)",
    "error": "No se puede eliminar la categoría porque tiene 2 producto(s) asociado(s)"
  }
  ```

### Productos

#### POST `/api/products` (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Bidón 20 Litros Retornable",
    "descripcion": "Agua purificada baja en sodio",
    "precio": 4200,
    "stock": 450,
    "categoria": "67be89b52044b7d1420cf111"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf222",
    "nombre": "Bidón 20 Litros Retornable",
    "descripcion": "Agua purificada baja en sodio",
    "precio": 4200,
    "stock": 450,
    "categoria": {
      "_id": "67be89b52044b7d1420cf111",
      "nombre": "Bidones",
      "descripcion": "Envases retornables y descartables"
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:00:00.000Z"
  }
  ```
- **Response `400 Bad Request` (Categoría inexistente):**
  ```json
  {
    "status": "error",
    "statusCode": 400,
    "message": "La categoría especificada no existe",
    "error": "La categoría especificada no existe"
  }
  ```

### Clientes y Populate Anidado

#### GET `/api/clients?zona=67be89b52044b7d1420cf333&activo=true`
- **Response `200 OK` (Populate anidado Cliente -> Localidad -> Zona):**
  ```json
  [
    {
      "_id": "67be89b52044b7d1420cf555",
      "nombre": "Consultorio Médico San Jerónimo",
      "telefono": "342-4521890",
      "direccion": "San Jerónimo 2840",
      "envasesEnPoder": 4,
      "saldo": 0,
      "activo": true,
      "observaciones": "Entregar de 8 a 12 hs",
      "localidad": {
        "_id": "67be89b52044b7d1420cf444",
        "nombre": "Santa Fe Capital",
        "provincia": "Santa Fe",
        "zona": {
          "_id": "67be89b52044b7d1420cf333",
          "nombre": "Zona Centro y Puerto",
          "diasDeReparto": ["Lunes", "Miércoles", "Viernes"]
        }
      },
      "createdAt": "2026-10-27T23:00:00.000Z",
      "updatedAt": "2026-10-27T23:00:00.000Z"
    }
  ]
  ```

### Ejemplos de Respuestas de Error Globales

#### Error 401 (Token ausente)
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Token no proporcionado",
  "error": "Token no proporcionado"
}
```

#### Error 401 (Token expirado)
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Token expirado",
  "error": "Token expirado"
}
```

#### Error 404 (Ruta inexistente)
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Ruta no encontrada: GET /api/ruta-desconocida",
  "error": "Ruta no encontrada: GET /api/ruta-desconocida"
}
```

#### Error 400 (Cuerpo JSON mal formado)
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "JSON mal formado en el cuerpo de la petición",
  "error": "JSON mal formado en el cuerpo de la petición"
}
```

---

## 7. Funcionalidades Implementadas y a Futuro

### Funcionalidades implementadas (Fase 1)
- Arquitectura en capas con aislamiento total de modelos dentro de la capa de servicios.
- Controladores livianos con manejo estandarizado de excepciones mediante clase `AppError` y middleware centralizado `handleError`.
- Autenticación JWT con expiración configurable y middleware `verifyToken` que diferencia token ausente, alterado o expirado.
- Hasheo de claves con `bcrypt` en hook asincrónico `pre('save')` de Mongoose 8.
- Reglas de negocio para integridad referencial en altas, actualizaciones y bloqueos en eliminaciones dependientes.
- Poblado automático de relaciones (`populate`) en todas las operaciones de consulta, incluyendo populate anidado en clientes.
- Filtros query avanzados por categoría, zona, localidad y estado comercial.
- Extra: Hoja de ruta logística (`/api/zones/:id/hoja-de-ruta`) con ordenamiento inteligente y vista de impresión web.
- Panel de control web en React con Vite, React Router, diseño responsive mobile-first, tablas convertibles a tarjetas, alertas de error enriquecidas y dashboard de estadísticas.

### Funcionalidades planificadas (Fases futuras)
1. **Hojas de ruta extendidas:** Programación de recorridos diarios con distinción entre reparto de agua cargada y recolección de envases vacíos.
2. **Cuotas y abonos mensuales:** Facturación periódica automatizada para alquileres de dispensers y servicios de sanitización.
3. **Avisos de cobro y recordatorios:** Notificaciones automáticas por WhatsApp o correo electrónico para saldos adeudados.
4. **Registro de pagos y reportes de ganancias:** Libro diario de ingresos y egresos con exportación directa a planillas Microsoft Excel (.xlsx) y PDF.
5. **Movimientos de reparto en la calle:** Aplicación de registro dinámico para que el conductor asiente entregas, cobros en efectivo/transferencia y roturas de envases en tiempo real.
6. **Caja diaria y arqueo:** Cierre de caja por vehículo y chofer al finalizar el turno.
7. **Gestión de flota y vehículos:** Control de kilometraje, capacidad de carga de bidones, seguros y vencimiento de revisiones técnicas obligatorias (RTO).
8. **Control de acceso basado en roles (RBAC):** Restricciones granulares en la API y front según rol (Administrador, Repartidor, Facturación).
9. **Paginación y optimización:** Implementación de paginación por cursores o páginas en consultas masivas de clientes y comprobantes.
10. **Documentación Swagger / OpenAPI:** Especificación interactiva para consumo por terceros.
11. **Testing automatizado:** Suite de tests unitarios e integración con Jest / Supertest.
12. **Despliegue continuo (CI/CD):** Dockerización del entorno con Docker Compose y despliegue automatizado en la nube (Render, Railway, AWS).
13. **Aplicación Web Progresiva (PWA):** Soporte offline para choferes en zonas de reparto con conectividad intermitente.

---

## 8. Variables de Entorno de Ejemplo (.env)

El archivo `.env` en la raíz del proyecto posee las siguientes variables requeridas:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/distribuidora_agua
JWT_SECRET=supersecretjwtkey_utn_proyecto_2026
JWT_EXPIRES_IN=2h
```

En la carpeta `frontend/.env` se configura el endpoint de comunicación:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 9. Estructura del Proyecto

```
proyecto-crud-mongodb/
├── app.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── clientController.js
│   │   ├── localityController.js
│   │   ├── productController.js
│   │   ├── userController.js
│   │   └── zoneController.js
│   ├── middleware/
│   │   └── verifyToken.js
│   ├── models/
│   │   ├── categoryModel.js
│   │   ├── clientModel.js
│   │   ├── localityModel.js
│   │   ├── productModel.js
│   │   ├── userModel.js
│   │   └── zoneModel.js
│   ├── routes/
│   │   ├── categoryRoute.js
│   │   ├── clientRoute.js
│   │   ├── localityRoute.js
│   │   ├── productRoute.js
│   │   ├── userRoute.js
│   │   └── zoneRoute.js
│   ├── services/
│   │   ├── categoryService.js
│   │   ├── clientService.js
│   │   ├── localityService.js
│   │   ├── productService.js
│   │   ├── userService.js
│   │   └── zoneService.js
│   └── utils/
│       ├── AppError.js
│       ├── handleError.js
│       └── seed.js
└── frontend/
    ├── .env
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   └── client.js
        ├── components/
        │   ├── ConfirmModal.jsx
        │   ├── EntityCrud.jsx
        │   ├── Layout.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── CategoriesPage.jsx
        │   ├── ClientsPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── HojaRutaPage.jsx
        │   ├── LocalitiesPage.jsx
        │   ├── LoginPage.jsx
        │   ├── ProductsPage.jsx
        │   └── ZonesPage.jsx
        ├── styles/
        │   └── main.css
        ├── App.jsx
        └── main.jsx
```
