# Auditoría de Custom Hooks - Frontend (`client/`)

**Fecha de relevamiento:** 1 de noviembre de 2026  
**Objetivo:** Analizar los patrones de estado, efectos y llamadas a la API en `client/src/` para identificar oportunidades de modularización mediante *Custom Hooks*, documentar casos que no justifican extracción y listar problemas de código detectados en la auditoría.

---

## 1. Tabla de Patrones Detectados y Hooks Propuestos

| Patrón detectado | Archivos donde aparece (con líneas) | Hook propuesto | Firma (parámetros y retorno) | Líneas aprox. ahorradas | Prioridad |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Carga de datos / Fetch asíncrono con `loading` y `error`**<br>Patrón repetido de `useState(data)`, `useState(loading)`, `useState(error)` y `useEffect` con `api.get()` sin control de cancelación (*race conditions*). | • `client/src/pages/LocalitiesPage.jsx`<br>• `client/src/pages/ProductsPage.jsx`<br>• `client/src/pages/ClientsPage.jsx`<br>• `client/src/pages/HojaRutaPage.jsx`<br>• `client/src/pages/DashboardPage.jsx`<br>• `client/src/components/EntityCrud.jsx` | `useFetch.js`<br>✅ *(Implementado en Fase 1)* | **Params:** `(fetcherOrUrl, dependencies = [], initialData = null)`<br>**Returns:** `{ data, loading, error, refetch, setData }` | ~80 - 100 líneas | **Alta** |
| **Consumo y acceso al contexto de autenticación**<br>`useAuth` estaba acoplado dentro del archivo `AuthContext.jsx` y se consumía en varios componentes de forma directa. | • `client/src/context/AuthContext.jsx`<br>• `client/src/components/ProtectedRoute.jsx`<br>• `client/src/components/Layout.jsx`<br>• `client/src/pages/LoginPage.jsx` | `useAuth.js`<br>✅ *(Implementado en Fase 1)* | **Params:** `()`<br>**Returns:** `{ user, token, isAuthenticated, login, logout }` | ~15 líneas (mejora arquitectónica de modularidad) | **Alta** |
| **Gestión completa de entidades CRUD (Headless CRUD)**<br>`EntityCrud.jsx` acumula la lógica de carga, creación (`POST`), edición (`PUT`), eliminación (`DELETE`), recarga y estados de notificación. | • `client/src/components/EntityCrud.jsx` (L18-138) | `useCrud.js` | **Params:** `(endpoint, options = { filters, onTransformSubmit, onTransformInitial })`<br>**Returns:** `{ items, loading, actionLoading, error, success, loadItems, createItem, updateItem, deleteItem, clearMessages }` | ~90 - 110 líneas (desacopla lógica de UI en `EntityCrud`) | **Alta** |
| **Manejo de Formularios (valores, cambio de campos, errores y submit)**<br>Control de campos en objeto o estados independientes, captura de `onChange` por propiedad y reseteo a valores iniciales. | • `client/src/pages/LoginPage.jsx` (L6-9, L18-30, L66, L82)<br>• `client/src/components/EntityCrud.jsx` (L34-38, L67-81, L92-116, L141-143) | `useForm.js` | **Params:** `(initialValues, onSubmit)`<br>**Returns:** `{ values, setValues, handleChange, handleFieldChange, reset, isSubmitting, error, setError, handleSubmit }` | ~40 - 55 líneas | **Media** |
| **Control de apertura/cierre de Modales y Paneles (`useDisclosure`)**<br>Control booleano repetido de apertura, cierre, toggle y pase de datos adjuntos (ej: entidad a editar o a eliminar). | • `client/src/components/EntityCrud.jsx` (L34, L40-41, L67-90, L108, L127-128)<br>• `client/src/components/Layout.jsx` (L7, L15-17, L127) | `useModal.js` *(o `useDisclosure.js`)* | **Params:** `(initialOpen = false)`<br>**Returns:** `{ isOpen, open, close, toggle, data, openWithData }` | ~30 - 40 líneas | **Media** |
| **Mensajes temporales con autocierre seguro (`useTimedMessage`)**<br>`setApiSuccess` con `setTimeout(..., 4000)` repetido en dos funciones distintas sin limpieza de timer al desmontar. | • `client/src/components/EntityCrud.jsx` (L22, L110, L130) | `useTimedMessage.js` | **Params:** `(duration = 4000)`<br>**Returns:** `{ message, showMessage, clearMessage }` | ~15 - 20 líneas (resuelve memory leak) | **Baja** |

---

## 2. Sección "No Conviene Extraer"

Los siguientes casos fueron analizados pero **no se recomienda** extraerlos en hooks específicos:

1. **Estado de impresión en `HojaRutaPage.jsx` (`L51-53`):**
   - *Código:* `const handlePrint = () => { window.print(); };`
   - *Motivo:* Es una única línea nativa del navegador. Crear un hook `usePrint()` agregaría sobrecarga cognitiva innecesaria sin aportar reutilización.
2. **Transformaciones puntuales de datos en `ClientsPage.jsx` y `ProductsPage.jsx`:**
   - *Código:* Callbacks `onTransformSubmit` y `onTransformInitial` para castear números y booleanos (`Number(precio)`, `Boolean(activo)`).
   - *Motivo:* Pertenecen a la regla de negocio de cada entidad particular. Extraerlos oscurecería la lógica específica de cada página; deben permanecer como funciones puras en el archivo de la vista.
3. **Mapeo de opciones para selects (`zoneOptions`, `categoryOptions`, `localityOptions`):**
   - *Código:* `.map(z => ({ value: z._id, label: z.nombre }))`
   - *Motivo:* Es un formateo simple de un array derivado durante el render. Es preferible resolverlo con un simple `useMemo` local si fuera pesado, o directamente en el render como está ahora.
4. **Hook exclusivo para el menú lateral en `Layout.jsx` (`mobileMenuOpen`):**
   - *Código:* `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`
   - *Motivo:* Si bien encaja con `useModal` o `useDisclosure`, crear un hook especializado `useSidebar` no se justifica porque existe un solo layout en toda la aplicación. Puede reutilizar el hook genérico `useModal` si se implementa, pero no un hook específico para sí mismo.

---

## 3. Orden de Implementación Recomendado

Se sugiere una estrategia en 3 etapas para minimizar el impacto y garantizar estabilidad:

### Fase 1: Fundacionales (Prioridad Alta)
1. **`useAuth.js`:**
   - Extraer `useAuth` a su propio archivo `client/src/hooks/useAuth.js` consumiendo `AuthContext`.
   - Ventaja: Cero riesgo de regresión, normaliza la arquitectura y cumple la convención de `client/src/hooks/`.
2. **`useFetch.js`:**
   - Implementar para resolver la carga de catálogos y colecciones (`LocalitiesPage`, `ProductsPage`, `ClientsPage`, `HojaRutaPage`, `DashboardPage`).
   - Resuelve de raíz las *race conditions* incorporando banderas de cancelación (`isMounted` o `AbortController`).

### Fase 2: Lógica de Entidades y Modales (Prioridad Media/Alta)
3. **`useModal.js`:**
   - Hook utilitario para estados abiertos/cerrados con datos asociados.
4. **`useCrud.js`:**
   - Extraer la lógica de negocio de `EntityCrud.jsx` a `useCrud.js`.
   - Permite que `EntityCrud.jsx` se convierta en un componente meramente presentacional.

### Fase 3: Formularios y Notificaciones (Prioridad Media/Baja)
5. **`useForm.js`:**
   - Estandarizar inputs en `LoginPage.jsx` y en el modal de `EntityCrud.jsx`.
6. **`useTimedMessage.js`:**
   - Manejo robusto de `apiSuccess` con `clearTimeout` automático en el ciclo de vida del componente.

---

## 4. Problemas y Anomalías Detectadas al Paso (Sin Modificar)

Durante la auditoría del código se observaron los siguientes problemas técnicos:

1. **Memory Leak por `setTimeout` sin limpieza en `EntityCrud.jsx` (L110 y L130):**
   - Se ejecutan temporizadores de 4 segundos (`setTimeout(() => setApiSuccess(''), 4000)`) sin almacenar el identificador ni ejecutar `clearTimeout` al desmontar el componente. Si el usuario navega a otra sección antes de los 4 segundos, se dispara un `setState` en un componente desmontado.
2. **Falta de limpieza en peticiones asíncronas (`useEffect` sin cancelación):**
   - En `LocalitiesPage.jsx` (L8-12), `ProductsPage.jsx` (L8-12), `ClientsPage.jsx` (L9-17) y `HojaRutaPage.jsx` (L27-43), las promesas de `api.get()` actualizan el estado sin comprobar si el componente sigue montado. Si la red tiene latencia y el usuario cambia de página, produce alertas de fuga de memoria o inconsistencias de estado.
3. **Acoplamiento de `client.js` con navegación completa de navegador (L44):**
   - En `client/src/api/client.js`, ante un error 401 se ejecuta:
     ```javascript
     window.location.href = '/login';
     ```
     Esto fuerza una recarga completa de la página en lugar de realizar una transición SPA mediante `useNavigate` de React Router. Además, la sincronización entre el cliente HTTP y `AuthContext` depende de un evento global del DOM (`window.dispatchEvent(new Event('auth:unauthorized'))`), el cual resulta frágil fuera del ciclo de vida de React.
4. **Captura silenciosa de errores en selects auxiliares:**
   - En `LocalitiesPage.jsx` (L11), `ProductsPage.jsx` (L11) y `ClientsPage.jsx` (L11-12), los llamados auxiliares terminan en `.catch(() => [])`. Si el servidor está caído o devuelve 500, la página no muestra ninguna alerta ni mensaje de error al usuario, simplemente deja los desplegables vacíos impidiendo guardar formularios.
5. **Doble llamada a `/zones` en `ClientsPage.jsx` (L12):**
   - `ClientsPage` consulta `/localities` y `/zones`. Las localidades ya traen embebida o referenciada su zona correspondiente. Dependiendo de los requerimientos de filtrado, podría optimizarse o unificarse la consulta.
