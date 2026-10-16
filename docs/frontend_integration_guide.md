# Guía de Integración Frontend: Historial, Trazabilidad y Reprogramación

Esta guía detalla cómo consumir e integrar en la interfaz de usuario los nuevos endpoints de estados, historial de árbitros y reprogramación sin duplicados.

---

## 1. Estados de la Designación

| Código | Nombre / Etiqueta | Color / Badge sugerido | Descripción |
| :---: | :--- | :--- | :--- |
| `0` | **Pendiente a completar** | Amarillo (`#f59e0b` / `warning`) | Cuadrilla incompleta o en borrador. Altas y bajas no generan ruido histórico. |
| `1` | **Aceptada / Completa** | Verde (`#10b981` / `success`) | Cuadrilla completa confirmada para la fecha. |
| `2` | **Finalizada** | Azul (`#3b82f6` / `info`) | Jornada disputada. Árbitros marcados con `participo = true`. |
| `3` | **Cancelada** | Rojo (`#ef4444` / `danger`) | Jornada cancelada definitivamente. Árbitros marcados con `participo = false`. |
| `4` | **Suspendida en juego** | Naranja oscuro (`#ea580c`) | Partido iniciado pero interrumpido en cancha (por ej. lluvia durante juego). |
| `5` | **Suspendida / Por reprogramar** | Púrpura / Naranja (`#8b5cf6` o `#f97316`) | Postergada antes de disputarse (ej. lluvia previa). Cuadrilla congelada para reprogramar. |

---

## 2. Nuevos Endpoints y Actualizaciones de API

Todos los endpoints requieren header `Authorization: Bearer <token>` con roles `SUPERUSER`, `PRESIDENTE` o `DESIGNADOR` (lecturas también permitidas para `SECRETARIO` y `ARBITRO`).

### 2.1 Suspender Designación
Postorga la jornada antes de jugarse o en juego, cambiando a estado `5` y capturando la foto de los árbitros asignados.
- **Método**: `PUT`
- **Ruta**: `/designaciones/{idDesignacion}/suspender`
- **Query Params**:
  - `motivo` *(opcional, string)*: Motivo de la suspensión (ej. `"Lluvia torrencial y cancha inundada"`).
- **Respuesta (`200 OK`)**: `GetDesignacionDTO` actualizado con `estadoDesignacion = 5`.

### 2.2 Reprogramar Designación (Sin Duplicados)
Actualiza la fecha de la **misma designación** existente (no crea copias ni cambia el ID). La designación vuelve a estar activa (`editable = true`, estado `1` o `0`).
- **Método**: `PUT`
- **Ruta**: `/designaciones/{idDesignacion}/reprogramar`
- **Query Params**:
  - `nuevaFecha` *(opcional, ISO LocalDateTime ej. `"2026-10-27T15:30:00"`)*: Si se omite, calcula automáticamente `fechaActual + 7 días`.
  - `motivo` *(opcional, string)*: Detalle de la reprogramación.
- **Respuesta (`200 OK`)**: `GetDesignacionDTO` con la fecha actualizada y mismo `idDesignacion`.

### 2.3 Reemplazar Árbitro (Atómico)
Sustituye a un árbitro en la cuadrilla en una sola operación. Valida reglas con el nuevo árbitro, desasigna al saliente marcándolo con `participo = false`, y asigna al nuevo.
- **Método**: `PUT`
- **Ruta**: `/designaciones/{idDesignacion}/arbitros/{idArbitroActual}/reemplazar`
- **Query Params**:
  - `idArbitroNuevo` *(requerido, Long)*: ID del árbitro que ingresa.
  - `motivo` *(opcional, string)*: Causa del reemplazo (ej. `"No disponible para la fecha reprogramada"`).
- **Respuesta (`200 OK`)**: `GetDesignacionDTO`.

### 2.4 Consultar Historial de Estados
Obtiene la línea de tiempo de todos los cambios de estado sufridos por la designación.
- **Método**: `GET`
- **Ruta**: `/designaciones/{idDesignacion}/historial-estados`
- **Respuesta (`200 OK`)**: Lista de `GetHistorialEstadoDTO`.
```json
[
  {
    "idHistorialEstado": 12,
    "idDesignacion": 45,
    "estadoAnterior": null,
    "estadoNuevo": 0,
    "descripcionEstadoAnterior": "Desconocido",
    "descripcionEstadoNuevo": "Pendiente a completar",
    "fechaCambio": "2026-10-20T10:15:00",
    "motivo": "Creación inicial de designación",
    "usuario": "admin"
  },
  {
    "idHistorialEstado": 13,
    "idDesignacion": 45,
    "estadoAnterior": 0,
    "estadoNuevo": 1,
    "descripcionEstadoAnterior": "Pendiente a completar",
    "descripcionEstadoNuevo": "Aceptada",
    "fechaCambio": "2026-10-22T18:30:00",
    "motivo": "Designación aceptada",
    "usuario": "designador1"
  },
  {
    "idHistorialEstado": 14,
    "idDesignacion": 45,
    "estadoAnterior": 1,
    "estadoNuevo": 5,
    "descripcionEstadoAnterior": "Aceptada",
    "descripcionEstadoNuevo": "Suspendida / Por reprogramar",
    "fechaCambio": "2026-10-24T08:00:00",
    "motivo": "Suspendida por lluvia torrencial",
    "usuario": "presidente"
  },
  {
    "idHistorialEstado": 15,
    "idDesignacion": 45,
    "estadoAnterior": 5,
    "estadoNuevo": 1,
    "descripcionEstadoAnterior": "Suspendida / Por reprogramar",
    "descripcionEstadoNuevo": "Aceptada",
    "fechaCambio": "2026-10-25T11:00:00",
    "motivo": "Reprogramación: fecha anterior 2026-10-24, nueva fecha 2026-10-31. Motivo: Reprogramada para el próximo sábado",
    "usuario": "designador1"
  }
]
```

### 2.5 Consultar Historial y Trazabilidad de Árbitros
Obtiene el registro histórico de todos los árbitros que estuvieron vinculados a la designación, indicando si participaron efectivamente o no.
- **Método**: `GET`
- **Ruta**: `/designaciones/{idDesignacion}/historial-arbitros`
- **Respuesta (`200 OK`)**: Lista de `GetHistorialArbitroDTO`.
```json
[
  {
    "idHistorialArbitro": 30,
    "idDesignacion": 45,
    "arbitro": {
      "idArbitro": 8,
      "nombre": "Carlos",
      "apellido": "López",
      "categoria": "INTERMEDIO"
    },
    "fechaAsignacion": "2026-10-20T10:20:00",
    "fechaDesasignacion": "2026-10-25T12:00:00",
    "participo": false,
    "motivo": "Reemplazado por Juan Gómez: No puede en la nueva fecha reprogramada",
    "partidosDirigidos": 0,
    "montoPercibido": 0.00,
    "activo": false
  },
  {
    "idHistorialArbitro": 31,
    "idDesignacion": 45,
    "arbitro": {
      "idArbitro": 14,
      "nombre": "Juan",
      "apellido": "Gómez",
      "categoria": "INTERMEDIO"
    },
    "fechaAsignacion": "2026-10-25T12:00:00",
    "fechaDesasignacion": null,
    "participo": true,
    "motivo": "Jornada finalizada",
    "partidosDirigidos": 3,
    "montoPercibido": 15000.00,
    "activo": true
  }
]
```

---

## 3. Flujos de UI Recomendados

### Flujo A: Suspender por Lluvia
1. En la tarjeta o detalle de la designación, agregar botón **"Suspender Jornada"** (disponible cuando estado es `0`, `1` o `4`).
2. Abrir modal solicitando motivo (por defecto: `"Suspendida por condiciones climáticas"`).
3. Enviar `PUT /designaciones/{id}/suspender?motivo=...`.
4. La UI actualiza el estado a `5` (badge "Suspendida / Por reprogramar").

### Flujo B: Reprogramar Jornada
1. En designaciones suspendidas (`5`) o canceladas (`3`), mostrar botón **"Reprogramar"**.
2. Abrir modal con:
   - **Nueva Fecha y Hora** (input datetime-local, con valor sugerido `fechaActual + 7 días`).
   - **Motivo / Nota** (input texto).
3. Enviar `PUT /designaciones/{id}/reprogramar?nuevaFecha=...&motivo=...`.
4. El backend mantiene el mismo `idDesignacion` y actualiza la fecha. No se recarga una nueva entidad ni se duplica la tarjeta.

### Flujo C: Reemplazar Árbitro
1. Al lado de cada árbitro de la cuadrilla asignada, mostrar botón de acción **"Reemplazar"** (icono de intercambio `⇄`).
2. Abrir modal selector de árbitros disponibles con campo "Motivo del cambio".
3. Enviar `PUT /designaciones/{id}/arbitros/{idActual}/reemplazar?idArbitroNuevo={idNuevo}&motivo={motivo}`.
4. El backend actualiza atómicamente la cuadrilla y asienta la trazabilidad.

### Flujo D: Modal / Pestaña "Historial y Trazabilidad"
Agregar botón o pestaña **"Ver Historial"** en la designación:
- **Pestaña 1: Historial de Estados**: Renderiza línea de tiempo vertical (Timeline) con fecha/hora, usuario, badge de estado anterior y nuevo, y el motivo.
- **Pestaña 2: Árbitros que pasaron por la designación**:
  - Tabla con columnas: `Árbitro`, `Categoría`, `Fecha Asignación`, `Estado en Cuadrilla` (Activo / Dado de baja), `¿Participó?` (Badge: Verde = Sí / Rojo = No / Gris = Pendiente), `Partidos Dirigidos`, `Motivo`.

---

## 4. Snippets de Código (JavaScript / Axios)

Para incorporar en `src/main/resources/static/js/services/designacionService.js` o en el frontend cliente:

```javascript
// Suspender designacion (cambia a estado 5 y captura snapshot de arbitros)
export const suspenderDesignacion = (idDesignacion, motivo) =>
  api.put(`/designaciones/${idDesignacion}/suspender`, null, {
    params: motivo ? { motivo } : undefined,
  }).then((r) => r.data || r);

// Reprogramar designacion sobre la misma entidad
export const reprogramarDesignacion = (idDesignacion, nuevaFecha, motivo) =>
  api.put(`/designaciones/${idDesignacion}/reprogramar`, null, {
    params: {
      ...(nuevaFecha ? { nuevaFecha } : {}),
      ...(motivo ? { motivo } : {}),
    },
  }).then((r) => r.data || r);

// Reemplazo atómico de un árbitro
export const reemplazarArbitro = (idDesignacion, idArbitroActual, idArbitroNuevo, motivo) =>
  api.put(`/designaciones/${idDesignacion}/arbitros/${idArbitroActual}/reemplazar`, null, {
    params: {
      idArbitroNuevo,
      ...(motivo ? { motivo } : {}),
    },
  }).then((r) => r.data || r);

// Consultar historial de estados
export const getHistorialEstados = (idDesignacion) =>
  api.get(`/designaciones/${idDesignacion}/historial-estados`).then((r) => r.data || r);

// Consultar trazabilidad de árbitros
export const getHistorialArbitros = (idDesignacion) =>
  api.get(`/designaciones/${idDesignacion}/historial-arbitros`).then((r) => r.data || r);
```

### Tipos TypeScript (Opcional)

```typescript
export interface HistorialEstadoDTO {
  idHistorialEstado: number;
  idDesignacion: number;
  estadoAnterior: number | null;
  estadoNuevo: number;
  descripcionEstadoAnterior: string;
  descripcionEstadoNuevo: string;
  fechaCambio: string; // ISO LocalDateTime
  motivo: string;
  usuario: string;
}

export interface HistorialArbitroDTO {
  idHistorialArbitro: number;
  idDesignacion: number;
  arbitro: {
    idArbitro: number;
    nombre: string;
    apellido: string;
    categoria: string;
  };
  fechaAsignacion: string;
  fechaDesasignacion: string | null;
  participo: boolean | null;
  motivo: string;
  partidosDirigidos: number | null;
  montoPercibido: number | null;
  activo: boolean;
}
```
