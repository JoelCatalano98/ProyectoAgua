# Sistema de Gestión de Reparto de Agua (Bidones y Dispensers) — TP Final Backend UTN BA

Sistema integral de gestión comercial y logística para distribuidoras de agua purificada envasada y dispensers, orientado a la administración de catálogos, delimitación de recorridos por localidades/zonas, cuentas corrientes de clientes y control de operadores.

## Demo en línea

- **Frontend:** https://my-crm-utn.vercel.app
- **API:** https://proyecto-agua-three.vercel.app

*El usuario y la contraseña del sitio desplegado se entregan por separado, y las credenciales del seed local (`admin@aguapura.com` / `admin1234`) son solo para desarrollo.*

**Stack tecnológico:** Node.js, Express, MongoDB (Mongoose) y React + Vite.  
**Autor:** Joel Catalano

---

## Índice

- [Demo en línea](#demo-en-línea)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Cumplimiento de la consigna](#cumplimiento-de-la-consigna)
- [Esquema de la base de datos](#esquema-de-la-base-de-datos)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Listado completo de endpoints](#listado-completo-de-endpoints)
- [Ejemplos de datos mock en JSON para solicitudes y respuestas](#ejemplos-de-datos-mock-en-json-para-solicitudes-y-respuestas)
- [Funcionalidades implementadas y a futuro](#funcionalidades-implementadas-y-a-futuro)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Despliegue en Vercel](#despliegue-en-vercel)

---

## Cómo correr el proyecto

Cada parte (`server/` para el backend y `client/` para el frontend) es un proyecto independiente y se ejecuta por separado.

### Requisitos previos
- Node.js instalado (versión 18 o superior).
- Instancia de MongoDB accesible (servicio local en `127.0.0.1:27017`, Docker o MongoDB Atlas).

### Backend (`server/`)
En una primera terminal:
```bash
cd server && npm install && npm run seed && npm start
```
- `npm run seed` puebla la base de datos con categorías, zonas, localidades, clientes, productos y el usuario administrador inicial.
- Para desarrollo con recarga automática, podés ejecutar `npm run dev`.
- El servidor queda disponible en `http://localhost:3000`.

> [!TIP]
> **Variables de entorno para desarrollo local (`server/.env.local`):**
> El archivo `server/.env` se mantiene versionado con valores de ejemplo/placeholders según lo requerido por la consigna del TP. Para desarrollo local, la aplicación carga automáticamente `server/.env.local` en primer lugar (ignorado por Git en `.gitignore`). Podés crear `server/.env.local` con tus variables locales reales (ej. un `JWT_SECRET` propio o URI personalizada); `dotenv` dará prioridad a las variables de `.env.local` sin sobreescribirlas con `.env`. La suite de tests automatizados (`npm test`) funciona de forma totalmente independiente con su propia configuración aislada (`_test`).

### Frontend (`client/`)
En una segunda terminal:
```bash
cd client && npm install && npm run dev
```
- Inicia el servidor de desarrollo Vite disponible habitualmente en `http://localhost:5173`.
- Para ingresar al sistema, usá las credenciales creadas por el seed:
  - **Email:** `admin@aguapura.com`
  - **Contraseña:** `admin1234`

### Tests automatizados del backend (`server/`)

La suite de pruebas automatizadas está desarrollada con **Jest** y **Supertest**, cubriendo todos los endpoints principales, validaciones de esquema (Zod), relaciones populadas, reglas de negocio y seguridad de roles.

#### Ejecución de las pruebas
Asegurate de tener MongoDB local corriendo en `127.0.0.1:27017` y ejecutá:

```bash
# Desde la carpeta server/:
cd server && npm test

# O directamente desde la raíz del proyecto:
npm test
```

> [!IMPORTANT]
> **Aislamiento y Seguridad de Datos:** Los tests utilizan una base de datos exclusiva para pruebas (`distribuidora_agua_test` vía la variable `MONGODB_URI_TEST`). Cuentan con un mecanismo de seguridad estricto que aborta inmediatamente la ejecución si la URI apunta a MongoDB Atlas (`mongodb+srv`) o si el nombre de la base de datos no termina en `_test`. La base de datos de desarrollo nunca es modificada ni eliminada por las pruebas.

---

## Cumplimiento de la consigna

| Requisito | Dónde está (archivo o carpeta) |
|---|---|
| Node.js + Express + MongoDB (Mongoose) | Todo el backend (`server/`) |
| **Productos**: nombre, descripción, precio, stock y categoría (referencia) | `server/src/models/productModel.js` (ver [Colección `products`](#colección-products)) |
| **Productos**: operaciones CRUD completas (`GET`, `POST`, `PUT`, `DELETE` y `PATCH`) | `server/src/routes/productRoute.js` (ver [Productos](#productos)) |
| **Categorías**: nombre y descripción; operaciones `GET`, `POST`, `PUT` y `DELETE` | `server/src/models/categoryModel.js`, `server/src/routes/categoryRoute.js` (ver [Categorías](#categorías)) |
| **Capa de servicios**: lógica de negocio y consultas Mongoose aisladas de los controladores | `server/src/services/` |
| **Controladores ligeros**: procesamiento de `req`, delegación al servicio y armado de `res` | `server/src/controllers/` |
| **Relación y `populate`**: Producto → Categoría en lecturas (`GET`) y mutaciones (`POST`, `PUT`) | `server/src/models/productModel.js`, `server/src/services/productService.js` (ver [Relaciones entre entidades](#relaciones-entre-entidades)) |
| **Códigos HTTP y manejo de errores**: respuestas estándar (200, 201, 400, 401, 403, 404, 409, 500) | `server/src/middleware/errorHandler.js`, `server/src/controllers/` (ver [Tabla de Códigos HTTP](#tabla-de-códigos-http-de-respuesta)) |
| **Variables de entorno (`dotenv`)**: URI de MongoDB y `JWT_SECRET` sin valores sensibles hardcodeados | `server/app.js`, `server/.env`, `server/.env.example` |
| **CORS**: habilitado en la aplicación principal | `server/app.js` |
| **Estructura modular de directorios**: separación en `models/`, `services/`, `controllers/`, `routes/`, `middleware/`, `config/` | Carpeta `server/` (ver [Estructura del Repositorio](#estructura-del-repositorio)) |
| **Usuarios y seguridad**: modelo de usuario, `bcrypt` en *pre-save hook*, JWT y middleware `verifyToken` | `server/src/models/userModel.js`, `server/src/middleware/verifyToken.js` (ver [Autenticación y Usuarios](#autenticación-y-usuarios)) |

**Extensiones y características adicionales:**  
Más allá de los requisitos básicos, el sistema incorpora un panel web completo en React (`client/`), ampliación del dominio con las entidades Localidades, Zonas y Clientes con jerarquía logística y generación de hoja de ruta de reparto imprimible (`server/src/services/localityService.js`), validaciones rigurosas de esquemas con Zod en todas las entradas, control de acceso basado en roles (`admin` y `repartidor`), limitación de tasa de peticiones en login con `express-rate-limit` contra fuerza bruta, y una suite de tests con Jest y Supertest cubriendo endpoints, seguridad y reglas de negocio.

---

## Esquema de la base de datos

### Relaciones entre entidades
- **Category (1) ── (N) Product**: Cada producto o servicio pertenece obligatoriamente a una categoría. No se permite eliminar una categoría con productos asignados.
- **Locality (1) ── (N) Zone**: Cada localidad o ciudad grande (ej. Rosario, Santa Fe) se divide en múltiples zonas para organizar el reparto sin ir y venir. No se permite eliminar una localidad con zonas vinculadas (HTTP 409).
- **Zone (1) ── (N) Client**: Cada zona pertenece obligatoriamente a una localidad y agrupa directamente a sus clientes asignados. El nombre de la zona es único dentro de cada localidad (índice compuesto `localidad + nombre`). No se permite eliminar una zona con clientes asociados (HTTP 409).
- **Client**: Cada cliente está asociado obligatoriamente a una `zona`. La localidad se obtiene automáticamente a través de la zona mediante populate anidado.

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

#### Colección: `localities`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único de la localidad |
| `nombre` | String | Sí | No | Nombre de la localidad o ciudad |
| `provincia` | String | No (def. 'Santa Fe') | No | Jurisdicción provincial |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `zones`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único de la zona |
| `nombre` | String | Sí | Compuesto | Nombre de la zona (único dentro de su localidad) |
| `localidad` | ObjectId (ref Locality) | Sí | No (Index) | Referencia indexada a la localidad de pertenencia |
| `diasDeReparto`| Array de Strings | No | No | Días asignados para visitas (Lunes a Sábado) |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `clients`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador del cliente |
| `nombre` | String | Sí | No | Razón social o nombre del particular |
| `telefono` | String | No | No | Teléfono de contacto |
| `direccion` | String | Sí | No | Dirección de entrega y facturación |
| `zona` | ObjectId (ref Zone) | Sí | No (Index) | Referencia indexada a la zona logística de reparto |
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
| `activo` | Boolean | Sí (def. true) | No | Estado de actividad del usuario (inactivo rechaza login con 401) |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

#### Colección: `settings`
| Campo | Tipo | Requerido | Único | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí (Auto) | Sí | Identificador único del documento |
| `nombreEmpresa` | String | Sí (def. 'Mi Empresa de Agua') | No | Nombre comercial de la empresa (2 a 80 caracteres) |
| `createdAt` | Date | Sí (Auto) | No | Marca temporal de creación |
| `updatedAt` | Date | Sí (Auto) | No | Marca temporal de última modificación |

---

## Tecnologías utilizadas

- **Backend:**
  - **Node.js** (Entorno de ejecución de JavaScript del lado del servidor)
  - **Express 4** (Framework HTTP y enrutamiento minimalista)
  - **MongoDB** (Base de datos documental NoSQL)
  - **Mongoose 8** (Modelado de datos ODM, esquemas con validaciones y hooks asincrónicos)
  - **Zod** (Validación rigurosa de esquemas en body, params y query con tipado estricto)
  - **express-rate-limit** (Limitador de peticiones para mitigación de fuerza bruta en login)
  - **JSON Web Token (jsonwebtoken)** (Autenticación sin estado mediante tokens firmados)
  - **bcrypt** (Hasheo salteado y verificación unidireccional de contraseñas)
  - **CORS** (Control de acceso HTTP entre orígenes)
  - **dotenv** (Carga de variables de entorno desde archivo `.env`)

- **Frontend:**
  - **React 18** (Biblioteca para interfaces de usuario declarativas basadas en componentes)
  - **Vite 6** (Herramienta de desarrollo y empaquetador ultrarrápido)
  - **React Router 6** (Enrutamiento del lado del cliente con navegación declarativa)
  - **CSS3 Moderno Puro** (Mobile-first, Flexbox, CSS Grid, variables CSS, vistas adaptables sin librerías pesadas)

- **Testing y Herramientas:**
  - **Jest 29** y **Supertest 7** (Suite de pruebas de integración para endpoints HTTP, seguridad y reglas de negocio)
  - **cross-env** (Gestión homogénea de variables de entorno multiplataforma en scripts)

---

## Listado completo de endpoints

### Tabla de Códigos HTTP de Respuesta
| Código | Significado | Escenario de uso |
|---|---|---|
| `200 OK` | Éxito en la consulta, modificación o baja | Búsquedas, lecturas individuales, PUT y DELETE exitosos |
| `201 Created` | Creación exitosa de recurso | POST exitoso en usuarios, productos, zonas, localidades, etc. |
| `400 Bad Request` | Error en la solicitud | Faltan campos requeridos, validaciones de Zod fallidas (con `detalles`), formato inválido o cuerpo JSON mal formado |
| `401 Unauthorized` | Fallo de autenticación | Token ausente, token expirado, token alterado o credenciales de login incorrectas |
| `403 Forbidden` | Permisos insuficientes | Token válido pero rol no autorizado (ej: repartidor accediendo a endpoints exclusivos de admin) |
| `404 Not Found` | Recurso o ruta no encontrada | Documento inexistente o ruta/endpoint no mapeado |
| `409 Conflict` | Conflicto con el estado actual del recurso | Recurso duplicado por clave única (nombre de categoría/zona, email) o bloqueo por regla de negocio al intentar eliminar un registro con dependencias (categoría con productos, zona con localidades, localidad con clientes) |
| `429 Too Many Requests` | Límite de peticiones excedido | Exceso de intentos fallidos de autenticación en login (rate limiting por IP) |
| `500 Internal Error` | Error de servidor no controlado | Fallo inesperado capturado por el middleware global (oculta trazas al cliente) |

### Endpoints de la API

| Método | Ruta | Descripción | Requiere Auth (JWT) | Rol Permitido |
|---|---|---|---|---|
| `GET` | `/` y `/api` | Ruta base informativa y estado de salud de la API | No | Público |
| `POST` | `/api/users/login` | Autenticación de usuario. Devuelve JWT y perfil | No | Público |
| `GET` | `/api/settings/public` | Obtener nombre público de la empresa | No | Público |
| `PUT` | `/api/settings` | Modificar nombre comercial de la empresa | Sí | `admin` |
| `GET` | `/api/users` | Listado completo de usuarios registrados (sin contraseña) | Sí | `admin` |
| `POST` | `/api/users` | Alta de nuevo usuario (nombre, email, password, rol, activo) | Sí | `admin` |
| `POST` | `/api/users/register` | Registro administrativo de usuarios | Sí | `admin` |
| `PUT` | `/api/users/:id` | Edición de usuario (nombre, rol, activo con reglas de negocio) | Sí | `admin` |
| `PATCH` | `/api/users/:id/password` | Restablecimiento de contraseña de un usuario | Sí | `admin` |
| `DELETE` | `/api/users/:id` | Eliminación de un usuario (con reglas de negocio) | Sí | `admin` |
| `GET` | `/api/categories` | Listado ordenado de todas las categorías | No | Público |
| `GET` | `/api/categories/:id` | Detalle de una categoría por su ID | No | Público |
| `POST` | `/api/categories` | Alta de nueva categoría | Sí | Autenticado |
| `PUT` | `/api/categories/:id` | Modificación de datos de categoría | Sí | Autenticado |
| `DELETE` | `/api/categories/:id` | Eliminación de categoría (falla con 409 si tiene productos asociados) | Sí | Autenticado |
| `GET` | `/api/products` | Listado de productos (admite filtro `?categoria=`) | No | Público |
| `GET` | `/api/products/:id` | Detalle de un producto con categoría poblada | No | Público |
| `POST` | `/api/products` | Alta de producto (valida existencia de categoría) | Sí | Autenticado |
| `PUT` | `/api/products/:id` | Actualización completa o de campos de producto | Sí | Autenticado |
| `PATCH` | `/api/products/:id` | Actualización parcial de producto | Sí | Autenticado |
| `DELETE` | `/api/products/:id` | Eliminación de producto | Sí | Autenticado |
| `GET` | `/api/localities` | Listado ordenado de localidades | No | Público |
| `GET` | `/api/localities/:id` | Detalle de localidad | No | Público |
| `GET` | `/api/localities/:id/hoja-de-ruta` | Hoja de reparto por localidad con zonas y clientes activos ordenados por dirección | No | Público |
| `POST` | `/api/localities` | Alta de localidad | Sí | Autenticado |
| `PUT` | `/api/localities/:id` | Modificación parcial de localidad | Sí | Autenticado |
| `DELETE` | `/api/localities/:id` | Eliminación de localidad (falla con 409 si tiene zonas asociadas) | Sí | Autenticado |
| `GET` | `/api/zones` | Listado de zonas con localidad poblada (filtro `?localidad=`) | No | Público |
| `GET` | `/api/zones/:id` | Detalle de una zona logística con su localidad | No | Público |
| `POST` | `/api/zones` | Alta de nueva zona logística (valida existencia de la localidad) | Sí | Autenticado |
| `PUT` | `/api/zones/:id` | Actualización de zona y días de atención | Sí | Autenticado |
| `DELETE` | `/api/zones/:id` | Eliminación de zona (falla con 409 si tiene clientes asociados) | Sí | Autenticado |
| `GET` | `/api/clients` | Listado con zona y localidad anidada pobladas (`?zona=`, `?localidad=`, `?activo=`) | No | Público |
| `GET` | `/api/clients/:id` | Detalle de cliente con zona y localidad anidadas | No | Público |
| `POST` | `/api/clients` | Alta de cliente (valida existencia de zona) | Sí | Autenticado |
| `PUT` | `/api/clients/:id` | Modificación parcial de cliente | Sí | Autenticado |
| `DELETE` | `/api/clients/:id` | Eliminación de cliente | Sí | Autenticado |

---

## Ejemplos de datos mock en JSON para solicitudes y respuestas

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
    "ok": false,
    "message": "Credenciales inválidas"
  }
  ```

#### POST `/api/users/register`
- **Descripción:** Registro administrativo de nuevos operadores en el sistema. Requiere autenticación con rol `admin`.
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Cómo obtener `<TOKEN_ADMIN>`:** Realizar previamente `POST /api/users/login` con las credenciales del administrador inicial generado por el seed (`admin@aguapura.com` / `admin1234`).
  > **Nota de seguridad:** Las credenciales `admin@aguapura.com` / `admin1234` son exclusivas del entorno de desarrollo y pruebas provistas por el comando seed (`npm run seed`), debiendo modificarse de forma obligatoria en cualquier despliegue productivo real.
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
    "ok": true,
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
- **Response `401 Unauthorized` (Token ausente):**
  ```json
  {
    "ok": false,
    "message": "Token no proporcionado"
  }
  ```
- **Response `403 Forbidden` (Usuario con rol repartidor intentando registrar):**
  ```json
  {
    "ok": false,
    "message": "Acceso denegado: permisos insuficientes"
  }
  ```


### Configuración de Empresa

#### GET `/api/settings/public`
- **Descripción:** Devuelve la configuración pública (nombre de la empresa) sin requerir autenticación.
- **Response `200 OK`:**
  ```json
  {
    "nombreEmpresa": "Mi Empresa de Agua"
  }
  ```

#### PUT `/api/settings`
- **Descripción:** Actualiza el nombre de la empresa. Requiere autenticación y rol `admin`.
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Request:**
  ```json
  {
    "nombreEmpresa": "Aguas del Litoral S.A."
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf100",
    "nombreEmpresa": "Aguas del Litoral S.A.",
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:15:00.000Z"
  }
  ```
- **Response `403 Forbidden` (repartidor intentando modificar):**
  ```json
  {
    "ok": false,
    "message": "Acceso denegado: permisos insuficientes"
  }
  ```

### Gestión Administrativa de Usuarios (Solo `admin`)

#### GET `/api/users`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Response `200 OK`:**
  ```json
  [
    {
      "_id": "67be89b52044b7d1420cf123",
      "nombre": "Administrador General",
      "email": "admin@aguapura.com",
      "rol": "admin",
      "activo": true,
      "createdAt": "2026-10-27T23:00:00.000Z",
      "updatedAt": "2026-10-27T23:00:00.000Z"
    },
    {
      "_id": "67be89b52044b7d1420cf124",
      "nombre": "Carlos Repartidor",
      "email": "carlos@aguapura.com",
      "rol": "repartidor",
      "activo": true,
      "createdAt": "2026-10-27T23:05:00.000Z",
      "updatedAt": "2026-10-27T23:05:00.000Z"
    }
  ]
  ```

#### POST `/api/users`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Request:**
  ```json
  {
    "nombre": "Martín Logística",
    "email": "martin@aguapura.com",
    "password": "claveSegura123",
    "rol": "repartidor",
    "activo": true
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf125",
    "nombre": "Martín Logística",
    "email": "martin@aguapura.com",
    "rol": "repartidor",
    "activo": true,
    "createdAt": "2026-10-27T23:10:00.000Z",
    "updatedAt": "2026-10-27T23:10:00.000Z"
  }
  ```

#### PUT `/api/users/:id`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Request:**
  ```json
  {
    "nombre": "Martín Logística Actualizado",
    "rol": "repartidor",
    "activo": false
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf125",
    "nombre": "Martín Logística Actualizado",
    "email": "martin@aguapura.com",
    "rol": "repartidor",
    "activo": false,
    "createdAt": "2026-10-27T23:10:00.000Z",
    "updatedAt": "2026-10-27T23:20:00.000Z"
  }
  ```
- **Response `400 Bad Request` (Regla de negocio: auto-desactivación de cuenta propia):**
  ```json
  {
    "ok": false,
    "message": "No puedes desactivar tu propia cuenta de usuario"
  }
  ```
- **Response `400 Bad Request` (Regla de negocio: dejar al sistema sin administradores activos):**
  ```json
  {
    "ok": false,
    "message": "No se puede desactivar ni quitar el rol al único administrador activo del sistema"
  }
  ```

#### PATCH `/api/users/:id/password`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Request:**
  ```json
  {
    "password": "nuevaContrasena2026"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "ok": true,
    "message": "Contraseña restablecida exitosamente",
    "user": {
      "_id": "67be89b52044b7d1420cf125",
      "nombre": "Martín Logística Actualizado",
      "email": "martin@aguapura.com",
      "rol": "repartidor",
      "activo": false,
      "updatedAt": "2026-10-27T23:25:00.000Z"
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

#### POST `/api/categories` (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Accesorios y Repuestos",
    "descripcion": "Canillas, porta bidones, vasos térmicos y repuestos de dispensers"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf112",
    "nombre": "Accesorios y Repuestos",
    "descripcion": "Canillas, porta bidones, vasos térmicos y repuestos de dispensers",
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:00:00.000Z"
  }
  ```

#### PUT `/api/categories/:id` (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Accesorios y Filtros",
    "descripcion": "Canillas, porta bidones, vasos térmicos, filtros y repuestos"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf112",
    "nombre": "Accesorios y Filtros",
    "descripcion": "Canillas, porta bidones, vasos térmicos, filtros y repuestos",
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:10:00.000Z"
  }
  ```

#### DELETE `/api/categories/:id`
- **Response `409 Conflict` (Violación de regla de negocio: tiene productos asociados):**
  ```json
  {
    "ok": false,
    "message": "No se puede eliminar la categoría porque tiene 2 productos asociados"
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
    "ok": false,
    "message": "La categoría especificada no existe"
  }
  ```

#### PUT `/api/products/:id` (Requiere Header: `Authorization: Bearer <token>`)
- **Request (Actualización completa o de campos):**
  ```json
  {
    "nombre": "Bidón 20 Litros Retornable Premium",
    "descripcion": "Agua purificada microfiltrada baja en sodio",
    "precio": 4500,
    "stock": 400,
    "categoria": "67be89b52044b7d1420cf111"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf222",
    "nombre": "Bidón 20 Litros Retornable Premium",
    "descripcion": "Agua purificada microfiltrada baja en sodio",
    "precio": 4500,
    "stock": 400,
    "categoria": {
      "_id": "67be89b52044b7d1420cf111",
      "nombre": "Bidones",
      "descripcion": "Envases retornables y descartables"
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:15:00.000Z"
  }
  ```

#### PATCH `/api/products/:id` (Requiere Header: `Authorization: Bearer <token>`)
- **Request (Modificación parcial de stock):**
  ```json
  {
    "stock": 500
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf222",
    "nombre": "Bidón 20 Litros Retornable",
    "descripcion": "Agua purificada baja en sodio",
    "precio": 4200,
    "stock": 500,
    "categoria": {
      "_id": "67be89b52044b7d1420cf111",
      "nombre": "Bidones",
      "descripcion": "Envases retornables y descartables"
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:05:00.000Z"
  }
  ```

### Localidades

#### POST `/api/localities` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Santo Tomé",
    "provincia": "Santa Fe"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf445",
    "nombre": "Santo Tomé",
    "provincia": "Santa Fe",
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:00:00.000Z"
  }
  ```

#### PUT `/api/localities/:id` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Santo Tomé Ciudad",
    "provincia": "Santa Fe"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf445",
    "nombre": "Santo Tomé Ciudad",
    "provincia": "Santa Fe",
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:10:00.000Z"
  }
  ```

### Zonas de Reparto

#### POST `/api/zones` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request (Valida existencia de la localidad y días de reparto permitidos):**
  ```json
  {
    "nombre": "Zona Costanera y 7 Jefes",
    "localidad": "67be89b52044b7d1420cf444",
    "diasDeReparto": ["Martes", "Jueves"]
  }
  ```
- **Response `201 Created` (Devuelve la zona con localidad poblada):**
  ```json
  {
    "_id": "67be89b52044b7d1420cf334",
    "nombre": "Zona Costanera y 7 Jefes",
    "diasDeReparto": ["Martes", "Jueves"],
    "localidad": {
      "_id": "67be89b52044b7d1420cf444",
      "nombre": "Santa Fe Capital",
      "provincia": "Santa Fe"
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:00:00.000Z"
  }
  ```

#### PUT `/api/zones/:id` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Zona Costanera Norte",
    "diasDeReparto": ["Martes", "Jueves", "Sábado"]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf334",
    "nombre": "Zona Costanera Norte",
    "diasDeReparto": ["Martes", "Jueves", "Sábado"],
    "localidad": {
      "_id": "67be89b52044b7d1420cf444",
      "nombre": "Santa Fe Capital",
      "provincia": "Santa Fe"
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:15:00.000Z"
  }
  ```

### Clientes y Populate Anidado

#### GET `/api/clients?localidad=67be89b52044b7d1420cf444&activo=true`
- **Response `200 OK` (Populate anidado Cliente -> Zona -> Localidad):**
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
      "zona": {
        "_id": "67be89b52044b7d1420cf333",
        "nombre": "Zona Centro y Puerto",
        "diasDeReparto": ["Lunes", "Miércoles", "Viernes"],
        "localidad": {
          "_id": "67be89b52044b7d1420cf444",
          "nombre": "Santa Fe Capital",
          "provincia": "Santa Fe"
        }
      },
      "createdAt": "2026-10-27T23:00:00.000Z",
      "updatedAt": "2026-10-27T23:00:00.000Z"
    }
  ]
  ```

#### POST `/api/clients` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request:**
  ```json
  {
    "nombre": "Estudio Jurídico Alvear",
    "telefono": "342-4589211",
    "direccion": "Alvear 3120",
    "zona": "67be89b52044b7d1420cf333",
    "envasesEnPoder": 2,
    "saldo": 0,
    "activo": true,
    "observaciones": "Timbre 2B - Horario de 9 a 17 hs"
  }
  ```
- **Response `201 Created` (Devuelve cliente con zona y localidad anidada pobladas):**
  ```json
  {
    "_id": "67be89b52044b7d1420cf556",
    "nombre": "Estudio Jurídico Alvear",
    "telefono": "342-4589211",
    "direccion": "Alvear 3120",
    "envasesEnPoder": 2,
    "saldo": 0,
    "activo": true,
    "observaciones": "Timbre 2B - Horario de 9 a 17 hs",
    "zona": {
      "_id": "67be89b52044b7d1420cf333",
      "nombre": "Zona Centro y Puerto",
      "diasDeReparto": ["Lunes", "Miércoles", "Viernes"],
      "localidad": {
        "_id": "67be89b52044b7d1420cf444",
        "nombre": "Santa Fe Capital",
        "provincia": "Santa Fe"
      }
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:00:00.000Z"
  }
  ```

#### PUT `/api/clients/:id` 🔒 (Requiere Header: `Authorization: Bearer <token>`)
- **Request (Modificación de datos o saldo de cuenta corriente):**
  ```json
  {
    "nombre": "Estudio Jurídico Alvear & Asociados",
    "telefono": "342-4589299",
    "direccion": "Alvear 3120 Piso 1",
    "envasesEnPoder": 3,
    "saldo": 8400,
    "activo": true,
    "observaciones": "Dejar bidones en portería"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "_id": "67be89b52044b7d1420cf556",
    "nombre": "Estudio Jurídico Alvear & Asociados",
    "telefono": "342-4589299",
    "direccion": "Alvear 3120 Piso 1",
    "envasesEnPoder": 3,
    "saldo": 8400,
    "activo": true,
    "observaciones": "Dejar bidones en portería",
    "zona": {
      "_id": "67be89b52044b7d1420cf333",
      "nombre": "Zona Centro y Puerto",
      "diasDeReparto": ["Lunes", "Miércoles", "Viernes"],
      "localidad": {
        "_id": "67be89b52044b7d1420cf444",
        "nombre": "Santa Fe Capital",
        "provincia": "Santa Fe"
      }
    },
    "createdAt": "2026-10-27T23:00:00.000Z",
    "updatedAt": "2026-10-27T23:20:00.000Z"
  }
  ```

### Hoja de Ruta Imprimible por Localidad

#### GET `/api/localities/:id/hoja-de-ruta`
- **Response `200 OK` (Localidad con zonas y clientes ordenados por dirección):**
  ```json
  {
    "localidad": {
      "_id": "67be89b52044b7d1420cf444",
      "nombre": "Santa Fe Capital",
      "provincia": "Santa Fe"
    },
    "cantidadZonas": 2,
    "totalClientes": 2,
    "zonas": [
      {
        "_id": "67be89b52044b7d1420cf333",
        "nombre": "Zona Centro y Puerto",
        "diasDeReparto": ["Lunes", "Miércoles", "Viernes"],
        "cantidadClientes": 1,
        "clientes": [
          {
            "_id": "67be89b52044b7d1420cf555",
            "nombre": "Consultorio Médico San Jerónimo",
            "direccion": "San Jerónimo 2840",
            "telefono": "342-4521890",
            "envasesEnPoder": 4,
            "saldo": 0,
            "observaciones": "Entregar de 8 a 12 hs"
          }
        ]
      }
    ]
  }
  ```

### Formato Único de Error y Respuestas Globales

Todas las respuestas de error de la API utilizan una estructura unificada y predecible:

```json
{
  "ok": false,
  "message": "Descripción clara del error",
  "detalles": [
    {
      "campo": "nombreDelCampo",
      "mensaje": "Motivo específico del fallo de validación"
    }
  ]
}
```

*Nota: La propiedad `detalles` es opcional y se incluye cuando existen errores de validación a nivel de campo.*

#### Error 400 Bad Request (Validación de datos con Zod)
```json
{
  "ok": false,
  "message": "Error de validación en los datos enviados",
  "detalles": [
    {
      "campo": "precio",
      "mensaje": "El precio no puede ser negativo"
    },
    {
      "campo": "categoria",
      "mensaje": "El identificador de categoría no es un ObjectId válido de 24 caracteres hexadecimales"
    }
  ]
}
```

#### Error 400 Bad Request (Cuerpo JSON mal formado)
```json
{
  "ok": false,
  "message": "JSON mal formado en el cuerpo de la petición"
}
```

#### Error 401 Unauthorized (Token ausente o inválido)
```json
{
  "ok": false,
  "message": "Token no proporcionado"
}
```
*(O `"Token expirado"` / `"Token inválido"` si el JWT caducó o fue adulterado).*

#### Error 404 Not Found (Ruta inexistente o recurso no encontrado)
```json
{
  "ok": false,
  "message": "Ruta no encontrada: GET /api/ruta-desconocida"
}
```

#### Error 409 Conflict (Recurso duplicado o violación de regla de negocio por dependencias)
- **Por clave única duplicada:**
```json
{
  "ok": false,
  "message": "Ya existe una categoría con ese nombre"
}
```
- **Por eliminación de recurso con entidades asociadas:**
```json
{
  "ok": false,
  "message": "No se puede eliminar la categoría porque tiene 2 productos asociados"
}
```

#### Error 429 Too Many Requests (Rate limit excedido en login)
```json
{
  "ok": false,
  "message": "Demasiados intentos de inicio de sesión desde esta IP. Por favor, intente nuevamente en 15 minutos."
}
```

#### Error 500 Internal Server Error (Error interno no previsto)
```json
{
  "ok": false,
  "message": "Error interno del servidor"
}
```
*(El detalle del stacktrace y causa técnica se loguea en la consola del servidor pero nunca se expone al cliente).*

---

## Funcionalidades implementadas y a futuro

### Funcionalidades implementadas (Fase 1)
- Arquitectura en capas con aislamiento total de modelos dentro de la capa de servicios.
- Controladores livianos con manejo estandarizado de excepciones mediante clase `AppError` y middleware centralizado `handleError`.
- Autenticación JWT con expiración configurable y middleware `verifyToken` que diferencia token ausente, alterado o expirado.
- Control de acceso basado en roles (RBAC): Autorización diferencial entre roles `admin` y `repartidor` en endpoints sensibles y rutas del frontend.
- Hasheo de claves con `bcrypt` en hook asincrónico `pre('save')` de Mongoose 8.
- Reglas de negocio para integridad referencial en altas, actualizaciones y bloqueos en eliminaciones dependientes (HTTP 409).
- Poblado automático de relaciones (`populate`) en todas las operaciones de consulta, incluyendo populate anidado en clientes.
- Filtros query avanzados por categoría, zona, localidad y estado comercial.
- Extra: Hoja de ruta logística por localidad (`/api/localities/:id/hoja-de-ruta`) con ordenamiento inteligente y vista de impresión estilo planilla/Excel.
- Panel de control web en React con Vite, React Router, diseño responsive mobile-first, tablas convertibles a tarjetas, alertas de error enriquecidas y dashboard de estadísticas.
- Pruebas automatizadas: Suite de tests con Jest y Supertest cubriendo endpoints, validaciones con Zod, seguridad de rutas y base aislada `_test`.

### Funcionalidades planificadas (Fases futuras)
1. **Hojas de ruta extendidas:** Programación de recorridos diarios con distinción entre reparto de agua cargada y recolección de envases vacíos.
2. **Cuotas y abonos mensuales:** Facturación periódica automatizada para alquileres de dispensers y servicios de sanitización.
3. **Avisos de cobro y recordatorios:** Notificaciones automáticas por WhatsApp o correo electrónico para saldos adeudados.
4. **Registro de pagos y reportes de ganancias:** Libro diario de ingresos y egresos con exportación directa a planillas Microsoft Excel (.xlsx) y PDF.
5. **Movimientos de reparto en la calle:** Aplicación de registro dinámico para que el conductor asiente entregas, cobros en efectivo/transferencia y roturas de envases en tiempo real.
6. **Caja diaria y arqueo:** Cierre de caja por vehículo y chofer al finalizar el turno.
7. **Gestión de flota y vehículos:** Control de kilometraje, capacidad de carga de bidones, seguros y vencimiento de revisiones técnicas obligatorias (RTO).
8. **Paginación y optimización:** Implementación de paginación por cursores o páginas en consultas masivas de clientes y comprobantes.
9. **Documentación Swagger / OpenAPI:** Especificación interactiva para consumo por terceros.
10. **Despliegue continuo (CI/CD):** Pipeline de integración continua y despliegue automatizado en la nube (Docker Compose, GitHub Actions).
11. **Aplicación Web Progresiva (PWA):** Soporte offline para choferes en zonas de reparto con conectividad intermitente.

---

## Estructura del Repositorio

El repositorio está organizado en dos partes claramente separadas e independientes: `server/` (backend) y `client/` (frontend).

> [!NOTE]
> **Estructura pedida por la consigna:** La carpeta `server/` contiene la estructura modular de directorios (`app.js`, `.env`, `.env.example`, `package.json`, `src/config/`, `src/controllers/`, `src/middleware/`, `src/models/`, `src/routes/`, `src/services/`, `src/utils/`) requerida por la consigna del TP. La carpeta `client/` contiene el desarrollo del frontend opcional como Single Page Application (SPA). En la raíz se incluye un `package.json` de conveniencia con scripts delegados (`npm test`, `npm run seed`) para facilitar la ejecución y evaluación directa desde la raíz del repositorio.

```
distribuidora-agua/
├── .gitignore
├── package.json             (scripts de conveniencia: npm test, npm run seed)
├── README.md
├── server/
│   ├── app.js                   (punto de entrada del servidor Express)
│   ├── jest.config.js           (configuración de entorno de pruebas Jest)
│   ├── vercel.json              (configuración de reescritura para serverless)
│   ├── .env                     (valores de ejemplo / placeholders para entrega)
│   ├── .env.example             (plantilla de variables con valores de ejemplo)
│   ├── .gitignore               (ignora node_modules/, logs y .env.local)
│   ├── package.json             (scripts y dependencias del backend)
│   ├── package-lock.json
│   ├── api/
│   │   └── index.js             (punto de entrada serverless para Vercel)
│   ├── scripts/
│   │   ├── backup_dev.js        (generación de backups JSON de colecciones de desarrollo)
│   │   └── migrate_hierarchy.js (migración de jerarquía de localidades y zonas)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            (conexión a MongoDB con Mongoose)
│   │   │   └── envValidator.js  (validación estricta de variables de entorno)
│   │   ├── controllers/         (controladores ligeros: gestionan req y res)
│   │   │   ├── categoryController.js
│   │   │   ├── clientController.js
│   │   │   ├── localityController.js
│   │   │   ├── productController.js
│   │   │   ├── settingsController.js
│   │   │   ├── userController.js
│   │   │   └── zoneController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   (manejador centralizado de errores)
│   │   │   ├── loginRateLimiter.js (límite de peticiones contra fuerza bruta)
│   │   │   ├── notFound.js       (captura de rutas 404 no existentes)
│   │   │   ├── requireRole.js    (control de acceso basado en roles RBAC)
│   │   │   ├── validate.js       (validador declarativo de esquemas Zod)
│   │   │   ├── verifyToken.js    (protección de rutas mediante JWT)
│   │   │   └── validators/       (esquemas de validación Zod por entidad)
│   │   │       ├── categoryValidator.js
│   │   │       ├── clientValidator.js
│   │   │       ├── commonValidators.js
│   │   │       ├── localityValidator.js
│   │   │       ├── productValidator.js
│   │   │       ├── settingsValidator.js
│   │   │       ├── userValidator.js
│   │   │       └── zoneValidator.js
│   │   ├── models/              (esquemas Mongoose y pre-save hook de bcrypt)
│   │   │   ├── categoryModel.js
│   │   │   ├── clientModel.js
│   │   │   ├── localityModel.js
│   │   │   ├── productModel.js
│   │   │   ├── settingsModel.js
│   │   │   ├── userModel.js
│   │   │   └── zoneModel.js
│   │   ├── routes/              (definición de rutas y mapeo a controladores)
│   │   │   ├── categoryRoute.js
│   │   │   ├── clientRoute.js
│   │   │   ├── localityRoute.js
│   │   │   ├── productRoute.js
│   │   │   ├── settingsRoute.js
│   │   │   ├── userRoute.js
│   │   │   └── zoneRoute.js
│   │   ├── services/            (capa de servicios: lógica de negocio y consultas)
│   │   │   ├── categoryService.js
│   │   │   ├── clientService.js
│   │   │   ├── localityService.js
│   │   │   ├── productService.js
│   │   │   ├── settingsService.js
│   │   │   ├── userService.js
│   │   │   └── zoneService.js
│   │   └── utils/
│   │       ├── AppError.js      (clase personalizada para errores operacionales)
│   │       ├── handleError.js   (utilidad para captura de errores asíncronos)
│   │       └── seed.js          (script de datos iniciales de prueba)
│   └── tests/                   (suite de pruebas de integración con Jest y Supertest)
│       ├── categories.test.js
│       ├── clients.test.js
│       ├── localities.test.js
│       ├── products.test.js
│       ├── security-safety.test.js
│       ├── users-settings.test.js
│       ├── zones.test.js
│       └── helpers/
│           ├── authHelper.js
│           ├── dbHelper.js
│           └── factories.js
└── client/
    ├── .env.example             (plantilla de variable de entorno para Vite)
    ├── .gitignore               (ignora node_modules/ y dist/)
    ├── vercel.json              (reescritura de rutas para SPA en Vercel)
    ├── index.html               (documento HTML raíz de la SPA)
    ├── package.json             (scripts y dependencias del frontend)
    ├── package-lock.json
    ├── vite.config.js           (configuración de Vite con plugin de React)
    └── src/
        ├── App.jsx              (árbol de rutas y navegación)
        ├── main.jsx             (punto de inicio React en el DOM)
        ├── api/
        │   └── client.js        (cliente HTTP unificado con fetch y JWT)
        ├── components/
        │   ├── ConfirmModal.jsx (modal accesible con manejo de reglas de negocio)
        │   ├── EntityCrud.jsx   (gestor genérico de operaciones CRUD)
        │   ├── ErrorBoundary.jsx (captura de errores inesperados de React)
        │   ├── Layout.jsx       (maquetación, barra superior y navegación lateral)
        │   ├── ProtectedRoute.jsx (guarda de rutas privadas)
        │   ├── QuickLocalityModal.jsx (alta rápida modal de localidades)
        │   └── QuickZoneModal.jsx     (alta rápida modal de zonas)
        ├── context/
        │   ├── AuthContext.jsx  (contexto de estado de usuario y autenticación)
        │   └── SettingsContext.jsx (contexto de configuración comercial)
        ├── hooks/               (Custom Hooks desacoplados)
        │   ├── README.md        (documentación de hooks del proyecto)
        │   ├── useAuth.js       (consumo ágil del contexto de autenticación)
        │   ├── useCrud.js       (lógica de estado CRUD y reglas de negocio)
        │   ├── useFetch.js      (peticiones asíncronas con bandera de montaje)
        │   ├── useForm.js       (control de campos, errores por campo y submit)
        │   ├── useModal.js      (apertura, cierre y datos de modales)
        │   ├── useSettings.js   (consumo del contexto de configuración)
        │   └── useTimedMessage.js (notificaciones temporales con autocierre)
        ├── pages/               (vistas completas de la aplicación)
        │   ├── CategoriesPage.jsx
        │   ├── ClientsPage.jsx
        │   ├── ConfiguracionPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── HojaRutaPage.jsx
        │   ├── LocalitiesPage.jsx
        │   ├── LoginPage.jsx
        │   ├── ProductsPage.jsx
        │   └── ZonesPage.jsx
        └── styles/
            └── main.css         (estilos CSS3 mobile-first sin librerías pesadas)
```

---

## Despliegue en Vercel

El proyecto está configurado para desplegarse en **Vercel** como dos proyectos independientes desde el mismo repositorio (arquitectura desacoplada en monorepo):
1. **Backend (`server/`):** API RESTful ejecutada como Serverless Function sobre Node.js con Express, conexión cacheada reutilizable a MongoDB Atlas y mitigación de fuerza bruta con `trust proxy`.
2. **Frontend (`client/`):** Single Page Application (SPA) construida con React y Vite, con reescritura de rutas hacia `index.html` para soporte de navegación directa y refresco con React Router.

---

### Paso a paso del despliegue

#### 1. Desplegar el Backend primero (`server/`)
1. En el panel de control de Vercel, hacer clic en **"Add New..."** > **"Project"** e importar este repositorio.
2. Configurar los parámetros del proyecto:
   - **Project Name:** `proyecto-agua` (o el nombre preferido para la API).
   - **Framework Preset:** `Other` (Node.js / Express Serverless).
   - **Root Directory:** Hacer clic en *Edit* y seleccionar la carpeta `server`.
   - **Build and Output Settings:** Dejar las opciones por defecto (Build Command y Output Directory vacíos).
3. En la sección **Environment Variables**, agregar las siguientes variables:
   | Variable | Valor de Ejemplo / Producción | Descripción |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority` | Cadena de conexión al clúster de MongoDB Atlas (debe incluir el nombre de la base de datos) |
   | `JWT_SECRET` | `<generá-un-secreto-aleatorio>` | **Obligatoria:** Clave secreta robusta para firma de tokens JWT (sin fallback; el backend aborta si falta o si en producción tiene menos de 32 caracteres) |
   | `JWT_EXPIRES_IN` | `2h` | Tiempo de vida del token antes de expirar |

   > [!WARNING]
   > **Generación de JWT_SECRET en producción:**
   > Nunca copies ni reutilices valores de la documentación en un entorno productivo. Generá un secreto criptográfico seguro y aleatorio ejecutando en tu terminal:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   > ```
   *(Nota: la variable `CLIENT_URL` se completará en el paso 3 una vez conocido el dominio del frontend).*
4. Hacer clic en **"Deploy"**.
5. Al finalizar, Vercel asignará la URL pública del backend:
   `https://proyecto-agua-three.vercel.app`

#### 2. Desplegar el Frontend (`client/`)
1. En Vercel, hacer clic nuevamente en **"Add New..."** > **"Project"** e importar el mismo repositorio.
2. Configurar los parámetros del proyecto:
   - **Project Name:** `my-crm-utn` (o el nombre preferido para la web).
   - **Framework Preset:** `Vite` (detectado automáticamente).
   - **Root Directory:** Hacer clic en *Edit* y seleccionar la carpeta `client`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. En la sección **Environment Variables**, agregar:
   | Variable | Valor de Producción | Descripción |
   |---|---|---|
   | `VITE_API_URL` | `https://proyecto-agua-three.vercel.app/api` | URL pública de la API desplegada en el paso 1 (con `/api` y **sin** barra final) |
4. Hacer clic en **"Deploy"**.
5. Al finalizar, Vercel asignará la URL pública del frontend:
   `https://my-crm-utn.vercel.app`

#### 3. Configurar `CLIENT_URL` en el Backend y Redeploy
Para habilitar la protección CORS en producción y admitir peticiones legítimas del frontend:
1. Ir al proyecto del backend en Vercel > **Settings** > **Environment Variables**.
2. Crear o editar la variable:
   - **Key:** `CLIENT_URL`
   - **Value:** `https://my-crm-utn.vercel.app`
   > `CLIENT_URL` admite varios dominios separados por coma (sin espacios ni barra final), por ejemplo: `https://my-crm-utn.vercel.app,http://localhost:5173`. Debe estar configurada en **Production**.
3. Ir a la pestaña **Deployments**, hacer clic en los tres puntos (`...`) del último despliegue y seleccionar **Redeploy** para aplicar los cambios de entorno.

#### 4. Poblado inicial de datos en MongoDB Atlas (Seed)
Para inicializar el catálogo de productos, zonas, localidades, clientes y el usuario administrador en la base de datos de producción:

> [!IMPORTANT]
> **Protección en bases remotas (Atlas):**  
> Para prevenir sobreescrituras accidentales en producción, el script de seed exige confirmar la operación mediante `SEED_CONFIRM=yes` y definir una contraseña propia y segura para el administrador mediante `SEED_ADMIN_PASSWORD` (el valor por defecto `admin1234` está bloqueado para bases remotas).

En **Bash / Linux / macOS**:
```bash
cd server
MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority" \
SEED_CONFIRM=yes \
SEED_ADMIN_PASSWORD="<tu-contraseña-segura-admin>" \
npm run seed
```

En **Windows PowerShell**:
```powershell
cd server
$env:MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority"
$env:SEED_CONFIRM="yes"
$env:SEED_ADMIN_PASSWORD="<tu-contraseña-segura-admin>"
npm run seed
```

---

### URLs del entorno productivo
- **API Backend:** `https://proyecto-agua-three.vercel.app`
- **Frontend Web:** `https://my-crm-utn.vercel.app`
- **Base de Datos:** MongoDB Atlas Cluster (`mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority`)

### Problemas comunes en Vercel

1. **CORS:**
   - La variable `CLIENT_URL` debe estar cargada en el entorno **Production** con el dominio fijo del frontend (`https://my-crm-utn.vercel.app`, sin espacios ni barra final). Tras configurarla, es obligatorio realizar un **Redeploy** del backend para que surta efecto.
2. **`[]` en `/api/categories`:**
   - La variable `MONGODB_URI` no incluye el nombre de la base de datos en la cadena de conexión (por ejemplo `mongodb+srv://.../?retryWrites=true` en vez de `mongodb+srv://.../distribuidora_agua?retryWrites=true`). Sin el nombre de la base, MongoDB conecta a `test` (que se encuentra vacía). Corregir la URI y hacer **Redeploy**.
3. **`VITE_API_URL` debe terminar en `/api` y requiere Redeploy del frontend:**
   - La URL de la API configurada en el cliente debe terminar con `/api` (ej. `https://proyecto-agua-three.vercel.app/api`). Como las variables de Vite se incrustan durante la compilación, cualquier ajuste exige un **Redeploy** del frontend para reconstruir el bundle.

### Usuario de prueba (cargado por el Seed)
- **Email:** `admin@aguapura.com`
- **Contraseña:** `admin1234` (en entorno local) o la configurada mediante `SEED_ADMIN_PASSWORD` (en MongoDB Atlas).
