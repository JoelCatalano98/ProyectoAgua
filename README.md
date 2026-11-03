# Sistema de Gestión de Reparto de Agua (Bidones y Dispensers) — TP Final Backend UTN BA

API RESTful desarrollada con Node.js, Express y MongoDB (Mongoose) aplicando arquitectura por capas con separación estricta de controladores y capa de servicios, complementada con un panel de administración web responsive desarrollado en React + Vite (`client/`).

El sistema administra el catálogo comercial de productos y servicios de una distribuidora de agua purificada, su delimitación logística por zonas y localidades, su cartera de clientes con cuenta corriente y la autenticación de operadores mediante JWT.

**Autor:** Joel Catalano

---

## Qué pide la consigna: obligatorio y opcional

| | Significa |
|---|---|
| 🔴 | **Obligatorio.** Lo pide la consigna. Sin esto, el TP no aprueba |
| 🟡 | **Opcional.** La consigna lo marca como opcional. Acá está hecho igual |
| ⚪ | **Extra.** No lo pide la consigna. Se agregó porque mejora el proyecto |

### 🔴 Obligatorio

| Requisito | Dónde está |
|---|---|
| Node.js + Express + MongoDB (Mongoose) | Todo el backend (`server/`) |
| **Productos**: nombre, descripción, precio, stock y categoría (referencia) | `server/src/models/productModel.js` |
| **Productos**: todas las operaciones CRUD | `server/src/routes/productRoute.js` |
| **Categorías**: nombre y descripción | `server/src/models/categoryModel.js` |
| **Categorías**: operaciones GET, POST, PUT y DELETE | `server/src/routes/categoryRoute.js` |
| **Capa de servicios**: toda la lógica de negocio y las llamadas a Mongoose | `server/src/services/` |
| **Controladores ligeros**: solo manejan HTTP y delegan al servicio | `server/src/controllers/` |
| **Relación** Producto → Categoría | `server/src/models/productModel.js` (campo `categoria`) |
| **`populate`** en las lecturas de productos | `server/src/services/productService.js` |
| Códigos HTTP apropiados (200, 201, 400, 401, 404, 409, 500) | `server/src/controllers/` y `server/src/middleware/errorHandler.js` |
| Manejo de excepciones con `try/catch` | Controladores en `server/src/controllers/` |
| **dotenv** para las variables sensibles | `server/app.js`, `server/.env` |
| **CORS** habilitado en la aplicación principal | `server/app.js` |
| La estructura de directorios pedida | Carpeta `server/` (ver [Estructura del repositorio](#estructura-del-repositorio)) |
| README con los puntos de la entrega | Este archivo |
| `.env` de ejemplo | `server/.env.example` |

> **Un detalle sobre bcrypt.** La consigna lo pide sin marcarlo como opcional, pero sirve para
> hashear la contraseña **del usuario**, y la entidad Usuarios sí es opcional. O sea: si tu
> proyecto no tiene usuarios, no hay contraseña que hashear. Si los tiene —como este—, bcrypt
> con pre-save hook es 🔴 obligatorio.

### 🟡 Opcional (hecho igual en este proyecto)

| Requisito | Dónde está |
|---|---|
| Entidad **Usuarios** (nombre, email, contraseña, rol) | `server/src/models/userModel.js` |
| **bcrypt** con *pre-save hook* para hashear la contraseña | `server/src/models/userModel.js` (hook `pre('save')`) |
| **JWT**: ruta de login que genera el token | `POST /api/users/login` (`server/src/routes/userRoute.js`, `server/src/controllers/userController.js`) |
| **JWT**: middleware que verifica el token y protege rutas sensibles | `server/src/middleware/verifyToken.js` |
| Frontend | Desarrollado de forma completa en `client/` (React + Vite + React Router; opcional según la consigna) |

### ⚪ Extras (no los pide la consigna)

| Extra | Por qué está / Dónde está |
|---|---|
| **Frontend completo (`client/`)** | Panel web SPA responsive para operar todo el sistema comercial y logístico |
| **Entidades de Zonas, Localidades y Clientes** | Ampliación del dominio con relaciones 1:N y populate anidado (`server/src/models/`, `server/src/routes/`, `server/src/services/`) |
| **Hoja de ruta logística** | Generación de hoja de reparto ordenada por zona y localidad con vista de impresión (`server/src/services/zoneService.js`, `client/src/pages/HojaRutaPage.jsx`) |
| **Validaciones rigurosas con Zod** | Validación estricta de esquema en body, params y query con reporte detallado de errores por campo (`server/src/middleware/validators/`, `server/src/middleware/validate.js`) |
| **Rate limiting en login** | Mitigación de ataques de fuerza bruta mediante `express-rate-limit` (HTTP 429) (`server/src/middleware/loginRateLimiter.js`) |
| **Custom Hooks desacoplados** | Modularización de lógica en React (`client/src/hooks/`: `useCrud`, `useForm`, `useFetch`, `useAuth`, `useModal`, `useTimedMessage`) |
| **`PATCH` además de `PUT` en productos** | `PATCH /api/products/:id` para actualización parcial de campos sin requerir el documento entero (`server/src/routes/productRoute.js`, `server/src/controllers/productController.js`) |
| **Manejo de errores centralizado** | Middleware `server/src/middleware/errorHandler.js` que unifica respuestas JSON de error y traduce fallos de Mongoose y Zod |
| **Protección contra borrado con dependencias (HTTP 409)** | Impide eliminar categorías con productos, zonas con localidades y localidades con clientes (`server/src/services/`) |
| **Verificación de existencia de referencias** | Validación en servicios de que categorías, zonas y localidades referenciadas existan antes de asociarlas |
| **Filtros avanzados por query params** | Filtrado en productos (`?categoria=`), localidades (`?zona=`) y clientes (`?zona=`, `?localidad=`, `?activo=`) |
| **Seed de base de datos** | Script `npm run seed` con catálogo y clientes de ejemplo para probar la aplicación inmediatamente (`server/src/utils/seed.js`) |
| **Ruta `GET /` de bienvenida** | Endpoint base con información y estado de la API (`server/app.js`) |

### Lo que la consigna permite cambiar

- **El dominio es libre.** Se pueden usar colecciones distintas a Productos y Categorías, siempre que **al menos un campo sea una referencia** a otra colección (en este proyecto se modelaron Productos → Categorías, Localidades → Zonas y Clientes → Localidades).
- El frontend no es obligatorio (en este proyecto se desarrolló una SPA completa en `client/`).
- Si no querés entregar el `.env` por seguridad, hay que hostear la aplicación (acá se versiona `server/.env` según lo requerido por la consigna y se provee `server/.env.example` como plantilla).

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
  - **Zod 3** (Validación rigurosa de esquemas en body, params y query con tipado estricto)
  - **express-rate-limit** (Limitador de peticiones para mitigación de fuerza bruta en login)
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

## Cómo Correr el Proyecto

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

### Frontend (`client/`)
En una segunda terminal:
```bash
cd client && npm install && npm run dev
```
- Inicia el servidor de desarrollo Vite disponible habitualmente en `http://localhost:5173`.
- Para ingresar al sistema, usá las credenciales creadas por el seed:
  - **Email:** `admin@aguapura.com`
  - **Contraseña:** `admin1234`

---

## 5. Listado Completo de Endpoints

### Tabla de Códigos HTTP de Respuesta
| Código | Significado | Escenario de uso |
|---|---|---|
| `200 OK` | Éxito en la consulta, modificación o baja | Búsquedas, lecturas individuales, PUT y DELETE exitosos |
| `201 Created` | Creación exitosa de recurso | POST exitoso en usuarios, productos, zonas, localidades, etc. |
| `400 Bad Request` | Error en la solicitud | Faltan campos requeridos, validaciones de Zod fallidas (con `detalles`), formato inválido o cuerpo JSON mal formado |
| `401 Unauthorized` | Fallo de autenticación | Token ausente, token expirado, token alterado o credenciales de login incorrectas |
| `404 Not Found` | Recurso o ruta no encontrada | Documento inexistente o ruta/endpoint no mapeado |
| `409 Conflict` | Conflicto con el estado actual del recurso | Recurso duplicado por clave única (nombre de categoría/zona, email) o bloqueo por regla de negocio al intentar eliminar un registro con dependencias (categoría con productos, zona con localidades, localidad con clientes) |
| `429 Too Many Requests` | Límite de peticiones excedido | Exceso de intentos fallidos de autenticación en login (rate limiting por IP) |
| `500 Internal Error` | Error de servidor no controlado | Fallo inesperado capturado por el middleware global (oculta trazas al cliente) |

### Endpoints de la API

| Método | Ruta | Descripción | Requiere Auth (JWT) |
|---|---|---|---|
| `POST` | `/api/users/register` | Registro de nuevos usuarios operadores | No |
| `POST` | `/api/users/login` | Autenticación de usuario. Devuelve JWT y perfil | No |
| `GET` | `/api/categories` | Listado ordenado de todas las categorías | No |
| `GET` | `/api/categories/:id` | Detalle de una categoría por su ID | No |
| `POST` | `/api/categories` | Alta de nueva categoría | Sí |
| `PUT` | `/api/categories/:id` | Modificación de datos de categoría | Sí |
| `DELETE` | `/api/categories/:id` | Eliminación de categoría (falla con 409 si tiene productos asociados) | Sí |
| `GET` | `/api/products` | Listado de productos (admite filtro `?categoria=`) | No |
| `GET` | `/api/products/:id` | Detalle de un producto con categoría poblada | No |
| `POST` | `/api/products` | Alta de producto (valida existencia de categoría) | Sí |
| `PUT` | `/api/products/:id` | Actualización completa o de campos de producto | Sí |
| `PATCH` | `/api/products/:id` | Actualización parcial de producto | Sí |
| `DELETE` | `/api/products/:id` | Eliminación de producto | Sí |
| `GET` | `/api/zones` | Listado de zonas con días de reparto | No |
| `GET` | `/api/zones/:id` | Detalle de una zona logística | No |
| `GET` | `/api/zones/:id/hoja-de-ruta` | Clientes activos de la zona ordenados por localidad y calle | No |
| `POST` | `/api/zones` | Alta de nueva zona logística | Sí |
| `PUT` | `/api/zones/:id` | Actualización de zona y días de atención | Sí |
| `DELETE` | `/api/zones/:id` | Eliminación de zona (falla con 409 si tiene localidades asociadas) | Sí |
| `GET` | `/api/localities` | Listado de localidades con zona poblada (filtro `?zona=`) | No |
| `GET` | `/api/localities/:id` | Detalle de localidad con zona poblada | No |
| `POST` | `/api/localities` | Alta de localidad (valida existencia de la zona) | Sí |
| `PUT` | `/api/localities/:id` | Modificación parcial de localidad | Sí |
| `DELETE` | `/api/localities/:id` | Eliminación de localidad (falla con 409 si tiene clientes asociados) | Sí |
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
    "ok": false,
    "message": "Credenciales inválidas"
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

## Estructura del Repositorio

El repositorio está organizado en dos partes claramente separadas e independientes: `server/` (backend) y `client/` (frontend).

> [!NOTE]
> **Estructura pedida por la consigna:** La carpeta `server/` contiene la estructura modular de directorios (`app.js`, `.env`, `.env.example`, `package.json`, `src/config/`, `src/controllers/`, `src/middleware/`, `src/models/`, `src/routes/`, `src/services/`, `src/utils/`) requerida por la consigna del TP. La carpeta `client/` contiene el desarrollo del frontend opcional como Single Page Application (SPA). No se utiliza un `package.json` en la raíz: cada parte gestiona sus dependencias, scripts de ejecución y ciclo de despliegue por separado.

```
distribuidora-agua/
├── .gitignore
├── README.md
├── READMEejemplo.md
├── server/
│   ├── app.js                   (punto de entrada del servidor Express)
│   ├── vercel.json              (configuración de reescritura para serverless)
│   ├── .env                     (variables de entorno con valores activos)
│   ├── .env.example             (plantilla de variables con valores de ejemplo)
│   ├── .gitignore               (ignora node_modules/ y logs)
│   ├── package.json             (scripts y dependencias del backend)
│   ├── package-lock.json
│   ├── api/
│   │   └── index.js             (punto de entrada serverless para Vercel)
│   └── src/
│       ├── config/
│       │   └── db.js            (conexión a MongoDB con Mongoose)
│       ├── controllers/         (controladores ligeros: gestionan req y res)
│       │   ├── categoryController.js
│       │   ├── clientController.js
│       │   ├── localityController.js
│       │   ├── productController.js
│       │   ├── userController.js
│       │   └── zoneController.js
│       ├── middleware/
│       │   ├── errorHandler.js   (manejador centralizado de errores)
│       │   ├── loginRateLimiter.js (límite de peticiones contra fuerza bruta)
│       │   ├── notFound.js       (captura de rutas 404 no existentes)
│       │   ├── validate.js       (validador declarativo de esquemas Zod)
│       │   ├── verifyToken.js    (protección de rutas mediante JWT)
│       │   └── validators/       (esquemas de validación Zod por entidad)
│       │       ├── categoryValidator.js
│       │       ├── clientValidator.js
│       │       ├── commonValidators.js
│       │       ├── localityValidator.js
│       │       ├── productValidator.js
│       │       ├── userValidator.js
│       │       └── zoneValidator.js
│       ├── models/              (esquemas Mongoose y pre-save hook de bcrypt)
│       │   ├── categoryModel.js
│       │   ├── clientModel.js
│       │   ├── localityModel.js
│       │   ├── productModel.js
│       │   ├── userModel.js
│       │   └── zoneModel.js
│       ├── routes/              (definición de rutas y mapeo a controladores)
│       │   ├── categoryRoute.js
│       │   ├── clientRoute.js
│       │   ├── localityRoute.js
│       │   ├── productRoute.js
│       │   ├── userRoute.js
│       │   └── zoneRoute.js
│       ├── services/            (capa de servicios: lógica de negocio y consultas)
│       │   ├── categoryService.js
│       │   ├── clientService.js
│       │   ├── localityService.js
│       │   ├── productService.js
│       │   ├── userService.js
│       │   └── zoneService.js
│       └── utils/
│           ├── AppError.js      (clase personalizada para errores operacionales)
│           ├── handleError.js   (utilidad para captura de errores asíncronos)
│           └── seed.js          (script de datos iniciales de prueba)
└── client/
    ├── .env                     (variable de entorno VITE_API_URL)
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
        │   └── ProtectedRoute.jsx (guarda de rutas privadas)
        ├── context/
        │   └── AuthContext.jsx  (contexto de estado de usuario y autenticación)
        ├── hooks/               (Custom Hooks desacoplados)
        │   ├── AUDITORIA.md     (informe técnico de auditoría de hooks)
        │   ├── README.md        (documentación de hooks del proyecto)
        │   ├── useAuth.js       (consumo ágil del contexto de autenticación)
        │   ├── useCrud.js       (lógica de estado CRUD y reglas de negocio)
        │   ├── useFetch.js      (peticiones asíncronas con bandera de montaje)
        │   ├── useForm.js       (control de campos, errores por campo y submit)
        │   ├── useModal.js      (apertura, cierre y datos de modales)
        │   └── useTimedMessage.js (notificaciones temporales con autocierre)
        ├── pages/               (vistas completas de la aplicación)
        │   ├── CategoriesPage.jsx
        │   ├── ClientsPage.jsx
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
   - **Project Name:** `distribuidora-agua-api` (o el nombre preferido para la API).
   - **Framework Preset:** `Other` (Node.js / Express Serverless).
   - **Root Directory:** Hacer clic en *Edit* y seleccionar la carpeta `server`.
   - **Build and Output Settings:** Dejar las opciones por defecto (Build Command y Output Directory vacíos).
3. En la sección **Environment Variables**, agregar las siguientes variables:
   | Variable | Valor de Ejemplo / Producción | Descripción |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority` | Cadena de conexión al clúster de MongoDB Atlas |
   | `JWT_SECRET` | `clave_secreta_super_segura_para_produccion_2026` | Clave secreta robusta para firma de tokens JWT |
   | `JWT_EXPIRES_IN` | `2h` | Tiempo de vida del token antes de expirar |
   *(Nota: la variable `CLIENT_URL` se completará en el paso 3 una vez conocido el dominio del frontend).*
4. Hacer clic en **"Deploy"**.
5. Al finalizar, Vercel asignará la URL pública del backend, por ejemplo:
   `https://distribuidora-agua-api.vercel.app`

#### 2. Desplegar el Frontend (`client/`)
1. En Vercel, hacer clic nuevamente en **"Add New..."** > **"Project"** e importar el mismo repositorio.
2. Configurar los parámetros del proyecto:
   - **Project Name:** `distribuidora-agua-client` (o el nombre preferido para la web).
   - **Framework Preset:** `Vite` (detectado automáticamente).
   - **Root Directory:** Hacer clic en *Edit* y seleccionar la carpeta `client`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. En la sección **Environment Variables**, agregar:
   | Variable | Valor de Ejemplo / Producción | Descripción |
   |---|---|---|
   | `VITE_API_URL` | `https://distribuidora-agua-api.vercel.app/api` | URL pública de la API desplegada en el paso 1 (con `/api` y **sin** barra final) |
4. Hacer clic en **"Deploy"**.
5. Al finalizar, Vercel asignará la URL pública del frontend, por ejemplo:
   `https://distribuidora-agua-client.vercel.app`

#### 3. Configurar `CLIENT_URL` en el Backend y Redeploy
Para habilitar la protección CORS en producción y admitir peticiones legítimas del frontend:
1. Ir al proyecto del backend en Vercel (`distribuidora-agua-api`) > **Settings** > **Environment Variables**.
2. Crear o editar la variable:
   - **Key:** `CLIENT_URL`
   - **Value:** `https://distribuidora-agua-client.vercel.app` *(admite múltiples dominios separados por coma si se requiere)*.
3. Ir a la pestaña **Deployments**, hacer clic en los tres puntos (`...`) del último despliegue y seleccionar **Redeploy** para aplicar los cambios de entorno.

#### 4. Poblado inicial de datos en MongoDB Atlas (Seed)
Para inicializar el catálogo de productos, zonas, localidades, clientes y el usuario administrador en la base de datos de producción:
```bash
cd server
MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority" npm run seed
```
> En **Windows PowerShell**:
> ```powershell
> cd server
> $env:MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority"
> npm run seed
> ```

---

### URLs del entorno productivo (Placeholders)
- **API Backend:** `https://distribuidora-agua-api.vercel.app`
- **Frontend Web:** `https://distribuidora-agua-client.vercel.app`
- **Base de Datos:** MongoDB Atlas Cluster (`mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/distribuidora_agua?retryWrites=true&w=majority`)

### Usuario de prueba (cargado por el Seed)
- **Email:** `admin@aguapura.com`
- **Contraseña:** `admin1234`
