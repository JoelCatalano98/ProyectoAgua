# API RESTful de Productos — TP Final Backend

API REST para administrar un catálogo de **productos** organizados por **categorías**, con
registro y login de **usuarios**. Toda la lógica de negocio vive en una capa de servicios
separada de los controladores.

Hecha con Node.js, Express y MongoDB (Mongoose).

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
| Node.js + Express + MongoDB (Mongoose) | todo el proyecto |
| **Productos**: nombre, descripción, precio, stock y categoría (referencia) | `src/models/productModel.js` |
| **Productos**: todas las operaciones CRUD | `src/routes/productRoute.js` |
| **Categorías**: nombre y descripción | `src/models/categoryModel.js` |
| **Categorías**: principalmente GET, POST y DELETE | `src/routes/categoryRoute.js` |
| **Capa de servicios**: toda la lógica de negocio y las llamadas a Mongoose | `src/services/` |
| **Controladores ligeros**: solo manejan HTTP y delegan al servicio | `src/controllers/` |
| **Relación** Producto → Categoría | `productModel.js` (campo `categoria`) |
| **`populate`** en las lecturas de productos | `src/services/productService.js` |
| Códigos HTTP apropiados (200, 201, 400, 404, 500) | controllers y `errorHandler.js` |
| Manejo de excepciones con `try/catch` | los tres controllers |
| **dotenv** para las variables sensibles | `index.js`, `.env` |
| **CORS** habilitado en la aplicación principal | `index.js` |
| La estructura de directorios pedida | ver [Estructura del proyecto](#estructura-del-proyecto) |
| README con los 8 puntos de la entrega | este archivo |
| `.env` de ejemplo | `.env.example` |

> **Un detalle sobre bcrypt.** La consigna lo pide sin marcarlo como opcional, pero sirve para
> hashear la contraseña **del usuario**, y la entidad Usuarios sí es opcional. O sea: si tu
> proyecto no tiene usuarios, no hay contraseña que hashear. Si los tiene —como este—, bcrypt
> con pre-save hook es 🔴 obligatorio.

### 🟡 Opcional (hecho igual en este proyecto)

| Requisito | Dónde está |
|---|---|
| Entidad **Usuarios** (nombre/email, contraseña) | `src/models/userModel.js` |
| **bcrypt** con *pre-save hook* para hashear la contraseña | `userModel.js` (hook `pre("save")`) |
| **JWT**: ruta de login que genera el token | `POST /api/users/login` |
| **JWT**: middleware que verifica el token y protege rutas sensibles | `src/middleware/verifyToken.js` |
| Frontend | no tiene: la consigna aclara que no es obligatorio |

### ⚪ Extras (no los pide la consigna)

| Extra | Por qué está |
|---|---|
| `errorHandler.js`: manejo de errores centralizado | la consigna solo pide `try/catch`; esto además traduce cada error de Mongoose a su código HTTP |
| Código **409** al borrar una categoría que tiene productos | evita dejar productos apuntando a una categoría inexistente |
| Verificar que la categoría exista antes de asignarla a un producto | Mongoose acepta un `_id` inventado: `ref` no es una foreign key |
| Filtro `GET /api/products?categoria=<id>` | práctico para probar la relación |
| `PATCH` además de `PUT` | PUT reemplaza, PATCH modifica solo algunos campos |
| `GET /api/users` (protegida) | para ver que las contraseñas nunca se devuelven |
| `npm run seed` con datos de ejemplo | para probar la API sin cargar todo a mano |
| Ruta `GET /` de bienvenida | saber de un vistazo si la API está viva |
| `.gitignore` | para no subir `node_modules` ni el `.env` |

### Lo que la consigna permite cambiar

- **El dominio es libre.** Se pueden usar colecciones distintas a Productos y Categorías,
  siempre que **al menos un campo sea una referencia** a otra colección.
- El frontend no es obligatorio.
- Si no querés entregar el `.env` por seguridad, hay que hostear la aplicación.

---

## Tecnologías

| Paquete | Para qué |
|---|---|
| **express** | servidor y rutas |
| **mongoose** | modelado y conexión a MongoDB |
| **dotenv** | variables de entorno |
| **bcrypt** | hashear las contraseñas |
| **jsonwebtoken** | generar y verificar los tokens JWT |
| **cors** | permitir que un frontend consuma la API |

---

## Esquema de la base de datos

### `categories`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `nombre` | String | obligatorio, único, mínimo 3 caracteres |
| `descripcion` | String | opcional, máximo 300 caracteres |
| `createdAt` / `updatedAt` | Date | automáticos |

### `products`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `nombre` | String | obligatorio, mínimo 2 caracteres |
| `descripcion` | String | opcional |
| `precio` | Number | obligatorio, no negativo |
| `stock` | Number | entero, no negativo, por defecto 0 |
| `categoria` | ObjectId | **referencia a `categories`**, obligatoria |
| `createdAt` / `updatedAt` | Date | automáticos |

### `users`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `nombre` | String | obligatorio, mínimo 3 caracteres |
| `email` | String | obligatorio, único, validado con regex |
| `password` | String | obligatoria, mínimo 6 caracteres, **hasheada con bcrypt**, `select: false` |
| `createdAt` / `updatedAt` | Date | automáticos |

### La relación

`Product.categoria` guarda el `_id` de un documento de `categories`. En las lecturas de
productos se usa `populate()` para traer la categoría completa en lugar del id:

```json
"categoria": { "_id": "6721...", "nombre": "Libros", "descripcion": "Narrativa, ensayo y técnicos" }
```

---

## Cómo correr el proyecto

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run seed
```

```bash
npm start
```

`npm run seed` es opcional: carga datos de ejemplo. `npm run dev` levanta el servidor
reiniciándolo solo cada vez que guardás un archivo.

Necesitás MongoDB corriendo (local o una URI de Atlas). La API queda en
`http://localhost:4000`.

Variables de entorno (ver `.env.example`):

| Variable | Ejemplo |
|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/tp_final_backend` |
| `PORT` | `4000` |
| `JWT_SECRET` | `clave-secreta-de-ejemplo-cambiala` |
| `JWT_EXPIRA` | `2h` |

El seed deja dos usuarios para probar: **ana@mail.com / ana12345** y
**bruno@mail.com / bruno123**.

---

## Endpoints

🔒 = necesita token.

### Productos — `/api/products`

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/products` | lista todos (con la categoría populada). Filtro opcional `?categoria=<id>` |
| GET | `/api/products/:id` | trae uno |
| POST | `/api/products` | 🔒 crea |
| PUT | `/api/products/:id` | 🔒 actualiza |
| PATCH | `/api/products/:id` | 🔒 actualiza parcialmente |
| DELETE | `/api/products/:id` | 🔒 elimina |

### Categorías — `/api/categories`

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/categories` | lista todas |
| GET | `/api/categories/:id` | trae una |
| POST | `/api/categories` | 🔒 crea |
| DELETE | `/api/categories/:id` | 🔒 elimina (falla con 409 si tiene productos) |

### Usuarios — `/api/users`

🟡 Toda esta sección es **opcional** según la consigna: existe porque implementamos la
autenticación con JWT.

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/api/users/register` | registra y devuelve el token |
| POST | `/api/users/login` | inicia sesión y devuelve el token |
| GET | `/api/users` | 🔒 lista los usuarios · ⚪ extra |

### Cómo mandar el token

Las rutas con 🔒 esperan este header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token sale de `POST /api/users/login` o de `POST /api/users/register`.

### Códigos de estado

| Código | Cuándo |
|---|---|
| 200 | todo bien |
| 201 | se creó un recurso |
| 400 | datos inválidos, id mal formado o valor duplicado |
| 401 | falta el token, o está vencido o es inválido |
| 404 | el recurso no existe |
| 409 | la operación no se puede hacer (ej. borrar una categoría con productos) |
| 500 | error interno |

---

## Datos de ejemplo (mock)

### POST `/api/users/register`

```json
{
  "nombre": "Carla Ruiz",
  "email": "carla@mail.com",
  "password": "carla123"
}
```

Respuesta `201`:

```json
{
  "usuario": { "_id": "6721a1b2c3d4e5f6a7b8c9d0", "nombre": "Carla Ruiz", "email": "carla@mail.com" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/users/login`

```json
{
  "email": "ana@mail.com",
  "password": "ana12345"
}
```

### POST `/api/categories` 🔒

```json
{
  "nombre": "Deportes",
  "descripcion": "Pelotas, raquetas y accesorios"
}
```

### POST `/api/products` 🔒

```json
{
  "nombre": "Pelota de fútbol",
  "descripcion": "Número 5, cuero sintético",
  "precio": 30000,
  "stock": 12,
  "categoria": "6721a1b2c3d4e5f6a7b8c9d0"
}
```

Respuesta `201`:

```json
{
  "_id": "6721b2c3d4e5f6a7b8c9d0e1",
  "nombre": "Pelota de fútbol",
  "descripcion": "Número 5, cuero sintético",
  "precio": 30000,
  "stock": 12,
  "categoria": {
    "_id": "6721a1b2c3d4e5f6a7b8c9d0",
    "nombre": "Deportes",
    "descripcion": "Pelotas, raquetas y accesorios"
  },
  "createdAt": "2026-10-27T18:30:00.000Z",
  "updatedAt": "2026-10-27T18:30:00.000Z",
  "__v": 0
}
```

### PATCH `/api/products/:id` 🔒

```json
{ "stock": 99 }
```

### Ejemplo de error `400`

```json
{
  "error": "Los datos no son válidos",
  "detalles": ["El precio es obligatorio", "La categoría es obligatoria"]
}
```

---

## Estructura del proyecto

```
tp-final-ejemplo/
├── index.js                 (punto de entrada)
├── .env
├── .env.example
├── package.json
└── src/
    ├── models/
    │   ├── productModel.js
    │   ├── userModel.js
    │   └── categoryModel.js
    ├── services/            <- lógica de negocio y acceso a la base
    │   ├── productService.js
    │   ├── userService.js
    │   └── categoryService.js
    ├── controllers/         <- solo manejan HTTP
    │   ├── productController.js
    │   ├── userController.js
    │   └── categoryController.js
    ├── routes/
    │   ├── productRoute.js
    │   ├── userRoute.js
    │   └── categoryRoute.js
    ├── config/
    │   ├── db.js            (conexión a MongoDB)
    │   └── seed.js          (datos de ejemplo)
    └── middleware/
        ├── verifyToken.js   (JWT)
        └── errorHandler.js  (manejo centralizado de errores)
```

### Separación de responsabilidades

- **Routes**: dicen qué URL llama a qué controlador. No tienen lógica.
- **Controllers**: leen `req`, llaman al servicio y arman `res`. No tocan Mongoose.
- **Services**: toda la lógica de negocio y las consultas a la base. No conocen `req` ni `res`.
- **Models**: la forma del dato y sus validaciones.

---

## Funcionalidades implementadas

🔴 obligatorio · 🟡 opcional · ⚪ extra

- 🔴 CRUD completo de productos (GET, POST, PUT, DELETE).
- 🔴 Categorías con GET, POST y DELETE.
- 🔴 Relación producto → categoría con `populate()` en las lecturas.
- 🔴 Códigos HTTP correctos y manejo de excepciones con `try/catch`.
- 🔴 CORS habilitado y variables de entorno con dotenv.
- 🟡 Registro y login de usuarios con contraseña hasheada (bcrypt, pre-save hook).
- 🟡 Autenticación con JWT y middleware que protege crear, actualizar y eliminar.
- ⚪ Manejo centralizado de errores, que traduce cada error de Mongoose a su código HTTP.
- ⚪ Filtro de productos por categoría (`?categoria=<id>`).
- ⚪ `PATCH` además de `PUT`.
- ⚪ Validación de que la categoría exista antes de asignarla a un producto.
- ⚪ Protección contra borrar una categoría que todavía tiene productos (409).
- ⚪ Script de carga de datos de ejemplo (`npm run seed`).

## Funcionalidades a futuro

- Roles de usuario (admin y cliente), para que no cualquier usuario logueado pueda borrar productos.
- Paginación y búsqueda por nombre en el listado de productos.
- Carrito de compras y órdenes.
- Subida de imágenes para los productos.
- Tests automatizados.
- Documentación con Swagger.
