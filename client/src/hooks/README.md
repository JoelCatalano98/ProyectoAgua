# Hooks Personalizados (`client/src/hooks`)

Este directorio contiene los **Custom Hooks** reutilizables de la aplicación React.

## Propósito
Centralizar y desacoplar la lógica de estado y efectos secundarios de los componentes visuales, promoviendo la reutilización de código, facilitando el testing unitario y manteniendo componentes limpios y declarativos.

## Convenciones de desarrollo
1. **Un hook por archivo:** Cada archivo debe definir y contener exclusivamente un único custom hook y sus funciones auxiliares directamente acopladas.
2. **Nomenclatura estándar:** Los archivos deben nombrarse en formato camelCase comenzando estrictamente con el prefijo `use`: `useXxx.js` (ej: `useAuth.js`, `useFetch.js`, `useForm.js`).
3. **Export nombrado:** Utilizar exportaciones nombradas (`export const useXxx = ...` o `export function useXxx(...)`) para facilitar el autocompletado en IDEs y evitar inconsistencias al renombrar importaciones.
4. **Reglas de Hooks:** Respetar rigurosamente las reglas oficiales de React (invocar hooks solo en el nivel superior de componentes o de otros hooks, nunca dentro de condicionales o bucles).
5. **Limpieza de efectos:** Todos los efectos (`useEffect`) que inicien suscripciones, temporizadores (`setTimeout`) o peticiones asíncronas deben implementar su respectiva función de limpieza (`cleanup`) para prevenir fugas de memoria y condiciones de carrera (*race conditions*).

## Índice de Hooks
- `useAuth`: Acceso centralizado al contexto global de autenticación (`user`, `token`, `isAuthenticated`, `login`, `logout`).
- `useFetch`: Peticiones asíncronas con gestión de `loading`, `error`, cancelación segura de respuestas tardías al desmontar y función de reintento `refetch`.
- `useModal`: Control de visibilidad y datos adjuntos de diálogos, modales o paneles laterales (`isOpen`, `open`, `close`, `toggle`, `data`, `openWithData`).
- `useCrud`: Operaciones completas de lectura (`GET`), alta (`POST`), modificación (`PUT`) y baja (`DELETE`) sobre endpoints REST, con estados `loading`, `actionLoading`, `error`, `errorStatus`, `errorDetalles` y `success`.
- `useForm`: Control unificado de campos, valores, validación enriquecida por campo (`fieldErrors`, `setFieldError`, `clearFieldError`, `setErrorsFromApi`), limpieza automática al editar, manejo de submit asíncrono y reseteo (`values`, `handleChange`, `handleFieldChange`, `reset`, `resetForm`, `isSubmitting`, `error`, `handleSubmit`).
- `useTimedMessage`: Mensajes temporales (alertas de éxito) con autocierre automático, reseteo entre mensajes y limpieza segura de temporizadores al desmontar el componente (`message`, `showMessage`, `clearMessage`).
