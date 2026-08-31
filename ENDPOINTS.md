# Documentación de Endpoints del Backend

Listado completo y detallado de los endpoints de la API de Designaciones.

---

## 1. Aranceles (`/aranceles`)

Gestiona las tarifas y aranceles según la cancha y la cantidad de partidos.

| Método | Endpoint                       | Parámetros / Body                                              | Respuesta             | Descripción                                                                                                                        |
|:-------|:-------------------------------|:---------------------------------------------------------------|:----------------------|:-----------------------------------------------------------------------------------------------------------------------------------|
| `GET`  | `/aranceles`                   | **Query:** `page` (int, default: 0), `size` (int, default: 30) | `Page<GetArancelDTO>` | Retorna listado paginado de todos los aranceles registrados en el sistema.                                                         |
| `GET`  | `/aranceles/cancha/{idCancha}` | **Path:** `idCancha` (Long)                                    | `List<GetArancelDTO>` | Devuelve todos los aranceles configurados para una cancha específica.                                                              |
| `POST` | `/aranceles`                   | **Body:** `ArancelDTO`                                         | `GetArancelDTO`       | Crea una nueva configuración de arancel para una cancha/partidos.                                                                  |
| `PUT`  | `/aranceles/actualizar`        | **Query:** `idArancel` (Long)<br>**Body:** `ArancelDTO`        | `GetArancelDTO`       | Actualiza un arancel existente por su identificador.                                                                               |
| `GET`  | `/aranceles/calcular`          | **Query:** `idCancha` (Long), `cantidadPartidos` (Integer)     | `Map<String, Object>` | Calcula y devuelve los árbitros necesarios y el monto estimado a percibir por cada árbitro para una cancha y cantidad de partidos. |

---

## 2. Árbitros (`/arbitros`)

Administración de árbitros, disponibilidades, estados y suspensiones.

| Método   | Endpoint                                   | Parámetros / Body                                                     | Respuesta                 | Descripción                                                                 |
|:---------|:-------------------------------------------|:----------------------------------------------------------------------|:--------------------------|:----------------------------------------------------------------------------|
| `POST`   | `/arbitros`                                | **Body:** `ArbitroDTO`                                                | `GetArbitroDTO`           | Registra un nuevo árbitro en el sistema.                                    |
| `PUT`    | `/arbitros/{idArbitro}`                    | **Path:** `idArbitro` (Long)<br>**Body:** `ArbitroDTO`                | `GetArbitroDTO`           | Modifica los datos personales y de contacto de un árbitro existente.        |
| `GET`    | `/arbitros`                                | **Query:** `page` (int), `size` (int)                                 | `Page<GetArbitroDTO>`     | Obtiene el listado general y paginado de árbitros.                          |
| `GET`    | `/arbitros/no-disponibles`                 | **Query:** `page` (int), `size` (int)                                 | `Page<GetArbitroDTO>`     | Lista árbitros que no están disponibles para ser designados.                |
| `PUT`    | `/arbitros/{idArbitro}/disponibilidad`     | **Path:** `idArbitro` (Long)<br>**Body:** `ArbitroDisponibilidadDTO`  | `GetArbitroDTO`           | Actualiza los días y franjas de disponibilidad de un árbitro.               |
| `GET`    | `/arbitros/traer-disponibles`              | **Query:** `page` (int), `size` (int)                                 | `Page<GetArbitroDTO>`     | Retorna todos los árbitros activos y marcados como disponibles.             |
| `DELETE` | `/arbitros/{idArbitro}`                    | **Path:** `idArbitro` (Long)                                          | `String`                  | Elimina un árbitro del sistema.                                             |
| `PUT`    | `/arbitros/modificar-disponibilidad-total` | *Ninguno*                                                             | `String`                  | Actualiza o restablece masivamente la disponibilidad de todos los árbitros. |
| `GET`    | `/arbitros/{idArbitro}/suspenciones`       | **Path:** `idArbitro` (Long)<br>**Query:** `page` (int), `size` (int) | `Page<GetSuspencionDTO>`  | Consulta el historial de sanciones/suspensiones de un árbitro específico.   |
| `POST`   | `/arbitros/{idArbitro}/suspenciones`       | **Path:** `idArbitro` (Long)<br>**Body:** `SuspencionDTO`             | `GetSuspencionDTO`        | Registra una nueva suspensión para el árbitro indicado.                     |
| `GET`    | `/arbitros/suspenciones`                   | **Query:** `page` (int), `size` (int)                                 | `Page<GetSuspencionDTO>`  | Lista todas las suspensiones globales registradas en el sistema.            |
| `DELETE` | `/arbitros/suspenciones/{idSuspencion}`    | **Path:** `idSuspencion` (Long)                                       | `String`                  | Elimina o levanta una sanción/suspensión por su ID.                         |
| `GET`    | `/arbitros/designaciones`                  | **Query:** `idArbitro` (Long), `page` (int), `size` (int)             | `Page<GetDesignacionDTO>` | Obtiene el historial de designaciones asignadas a un árbitro.               |

---

## 3. Autenticación (`/auth`)

Control de acceso y seguridad mediante tokens JWT.

| Método | Endpoint       | Parámetros / Body                              | Respuesta      | Descripción                                                                     |
|:-------|:---------------|:-----------------------------------------------|:---------------|:--------------------------------------------------------------------------------|
| `POST` | `/auth/login`  | **Body:** `AuthLogin` (`username`, `password`) | `AuthResponse` | Autentica las credenciales y genera el token Bearer JWT con roles y expiración. |
| `POST` | `/auth/logout` | **Header:** `Authorization: Bearer <token>`    | `String`       | Cierra la sesión activa del usuario e invalida el contexto de seguridad.        |

---

## 4. Backups y Respaldo (`/backup`)

Exportación e importación de la base de datos completa.

| Método | Endpoint              | Parámetros / Body                     | Respuesta                     | Descripción                                                                   |
|:-------|:----------------------|:--------------------------------------|:------------------------------|:------------------------------------------------------------------------------|
| `GET`  | `/backup/export/json` | *Ninguno*                             | `byte[]` (`application/json`) | Descarga un snapshot completo de las entidades en formato JSON con timestamp. |
| `GET`  | `/backup/export/sql`  | *Ninguno*                             | `byte[]` (`text/plain`)       | Genera y descarga un script con sentencias SQL para recrear los datos.        |
| `POST` | `/backup/import/json` | **Form-Data:** `file` (MultipartFile) | `String`                      | Restaura la base de datos a partir de un archivo de backup JSON provisto.     |

---

## 5. Canchas (`/canchas`)

Administración de canchas, predios y estados de operatividad.

| Método | Endpoint                         | Parámetros / Body                                        | Respuesta                 | Descripción                                                                |
|:-------|:---------------------------------|:---------------------------------------------------------|:--------------------------|:---------------------------------------------------------------------------|
| `GET`  | `/canchas`                       | **Query:** `page` (int), `size` (int)                    | `Page<GetCanchaDTO>`      | Lista paginada de todas las canchas registradas.                           |
| `GET`  | `/canchas/activas`               | **Query:** `page` (int), `size` (int)                    | `Page<GetCanchaDTO>`      | Lista únicamente las canchas que están actualmente habilitadas para juego. |
| `PUT`  | `/canchas/{idCancha}/toggle`     | **Path:** `idCancha` (Long)                              | `Void` (204)              | Alterna el estado activo/inactivo de una cancha.                           |
| `POST` | `/canchas`                       | **Body:** `CanchaDTO`                                    | `GetCanchaDTO`            | Registra una nueva cancha en el sistema.                                   |
| `GET`  | `/canchas/designaciones`         | **Query:** `idCancha` (Long), `page` (int), `size` (int) | `Page<GetDesignacionDTO>` | Retorna todas las designaciones asociadas a una cancha determinada.        |
| `PUT`  | `/canchas/actualizar/{idCancha}` | **Path:** `idCancha` (Long)<br>**Body:** `CanchaDTO`     | `GetCanchaDTO`            | Actualiza la información y configuración de una cancha existente.          |

---

## 6. Designaciones (`/designaciones`)

Gestión de jornadas, asignación de árbitros, estados del partido y reportes estadísticos.

| Método   | Endpoint                                              | Parámetros / Body                                                                                                                            | Respuesta                               | Descripción                                                                                  |
|:---------|:------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------|:---------------------------------------------------------------------------------------------|
| `POST`   | `/designaciones`                                      | **Body:** `DesignacionDTO`                                                                                                                   | `GetDesignacionDTO`                     | Crea una nueva jornada de designación.                                                       |
| `PUT`    | `/designaciones/{idDesignacion}`                      | **Path:** `idDesignacion` (Long)<br>**Body:** `DesignacionDTO`                                                                               | `GetDesignacionDTO`                     | Modifica datos generales de una designación (cancha, fecha, aranceles, etc.).                |
| `GET`    | `/designaciones/{idDesignacion}`                      | **Path:** `idDesignacion` (Long)                                                                                                             | `GetDesignacionDTO`                     | Obtiene el detalle completo de una designación por su identificador.                         |
| `POST`   | `/designaciones/{idDesignacion}/sincronizar-arancel`  | **Path:** `idDesignacion` (Long)                                                                                                             | `String`                                | Calcula y sincroniza automáticamente los montos y aranceles según la cancha y partidos.      |
| `GET`    | `/designaciones/mes`                                  | **Query:** `mes` (int), `anio` (int)                                                                                                         | `List<GetDesignacionDTO>`               | Obtiene todas las designaciones calendarizadas para un mes y año dados.                      |
| `PUT`    | `/designaciones/{idDesignacion}/cambiar-cancelado`    | **Path:** `idDesignacion` (Long)<br>**Query:** `detalle` (String)                                                                            | `GetDesignacionDTO`                     | Pasa la designación a estado **Cancelada** (estado 3) indicando el motivo.                   |
| `GET`    | `/designaciones/buscar`                               | **Query:** `inicio` (LocalDate `YYYY-MM-DD`, opcional), `fin` (LocalDate `YYYY-MM-DD`, opcional), `fecha` (LocalDate `YYYY-MM-DD`, opcional) | `List<GetDesignacionDTO>`               | Busca designaciones en un rango o para una fecha puntual (unificado).                        |
| `GET`    | `/designaciones`                                      | **Query:** `estado` (int, default: 1), `page` (int), `size` (int)                                                                            | `Page<GetDesignacionDTO>`               | Lista paginada por estado *(0: Pendiente, 1: Aceptada, 2: Finalizada, 3: Cancelada)*.        |
| `PUT`    | `/designaciones/{idDesignacion}/finalizar`            | **Path:** `idDesignacion` (Long)<br>**Query:** `detalle` (String, opcional)                                                                  | `GetDesignacionDTO`                     | Marca la jornada como **Finalizada** (estado 2) e impacta las estadísticas/finanzas.         |
| `PUT`    | `/designaciones/{idDesignacion}/aceptar`              | **Path:** `idDesignacion` (Long)                                                                                                             | `GetDesignacionDTO`                     | Confirma y pasa la designación a estado **Aceptada** (estado 1).                             |
| `PUT`    | `/designaciones/{idDesignacion}/reprogramar`          | **Path:** `idDesignacion` (Long)                                                                                                             | `GetDesignacionDTO`                     | Marca la designación para reprogramación.                                                    |
| `POST`   | `/designaciones/{idDesignacion}/arbitros`             | **Path:** `idDesignacion` (Long)<br>**Query:** `idArbitro` (Long), `forzar` (boolean, default: false), `historico` (boolean, default: false) | `GetDesignacionDTO`                     | **Endpoint Unificado de Asignación**: Asigna un árbitro en modo normal, forzado o histórico. |
| `DELETE` | `/designaciones/{idDesignacion}/arbitros/{idArbitro}` | **Path:** `idDesignacion` (Long), `idArbitro` (Long)                                                                                         | `GetDesignacionDTO`                     | Desvincula a un árbitro de la designación y actualiza el estado si queda incompleta.         |
| `DELETE` | `/designaciones/{idDesignacion}`                      | **Path:** `idDesignacion` (Long)                                                                                                             | `Void` (204)                            | Elimina por completo una designación.                                                        |
| `POST`   | `/designaciones/{idDesignacion}/arbitros/bulk`        | **Path:** `idDesignacion` (Long)<br>**Body:** `List<Long>` (idsArbitros)                                                                     | `GetDesignacionDTO`                     | Asigna masivamente una lista de árbitros a la jornada.                                       |
| `GET`    | `/designaciones/estadisticas`                         | **Query:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional)                                                                       | `GetEstadisticasDesignacionesDTO`       | Obtiene métricas generales de partidos, importes y designaciones en un periodo.              |
| `GET`    | `/designaciones/estadisticas/arbitro/{idArbitro}`     | **Path:** `idArbitro` (Long)<br>**Query:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional)                                       | `GetEstadisticasArbitroDetalleDTO`      | Retorna estadísticas individuales de desempeño y partidos de un árbitro.                     |
| `GET`    | `/designaciones/estadisticas/comparacion`             | **Query:** `idsArbitros` (List<Long>), `mesInicio` (int, default: 1), `mesFin` (int, default: 12)                                            | `GetComparacionEstadisticasArbitrosDTO` | Comparativa estadística de actividad e ingresos entre múltiples árbitros.                    |
| `GET`    | `/designaciones/ultimas-designaciones`                | *Ninguno*                                                                                                                                    | `List<GetDesignacionDTO>`               | Retorna las designaciones más recientes cargadas en el sistema.                              |

### Cómo realizar las peticiones en `/designaciones/{idDesignacion}/arbitros`:

- **Asignación Normal**: `POST /designaciones/10/arbitros?idArbitro=5` (Aplica todas las validaciones de etapa, chofer,
  cancha repetida, etc.)
- **Asignación Forzada**: `POST /designaciones/10/arbitros?idArbitro=5&forzar=true` (Omite restricciones de etapa y
  cancha repetida si es necesario)
- **Asignación Histórica**: `POST /designaciones/10/arbitros?idArbitro=5&historico=true` (Carga histórica directa sin
  validaciones en tiempo real)

---

## 7. Designados (`/designados`)

Operaciones sobre los árbitros asignados a cada jornada y sus importes percibidos.

| Método   | Endpoint                                               | Parámetros / Body                                                         | Respuesta                | Descripción                                                                            |
|:---------|:-------------------------------------------------------|:--------------------------------------------------------------------------|:-------------------------|:---------------------------------------------------------------------------------------|
| `GET`    | `/designados`                                          | **Query:** `idDesignacion` (Long)                                         | `List<GetDesignadosDTO>` | Lista todos los árbitros designados a una jornada con sus datos y montos asignados.    |
| `DELETE` | `/designados/eliminar-designado`                       | **Query:** `idDesignacion` (Long), `idDesignado` (Long)                   | `Void` (204)             | Elimina un registro de árbitro designado por ID de asignación.                         |
| `PUT`    | `/designados/{idDesignado}/actualizar-monto-percibido` | **Path:** `idDesignado` (Long)<br>**Query:** `nuevoMonto` (BigDecimal)    | `String`                 | Modifica el monto a percibir asignado a un árbitro designado específico.               |
| `PUT`    | `/designados/actualizar-monto-a-designados`            | **Query:** `idDesignacion` (Long), `montoPorArbitro` (BigDecimal)         | `String`                 | Actualiza de forma uniforme el monto a cobrar para todos los designados de la jornada. |
| `PUT`    | `/designados/actualizar-cantidad-partidos`             | **Query:** `idDesignacion` (Long), `idDesignado` (Long), `cantidad` (int) | `String`                 | Asigna o modifica la cantidad de partidos dirigidos por un árbitro en esa designación. |

---

## 8. Finanzas (`/finanzas`)

Manejo de caja, conceptos, gastos, préstamos, transacciones y cobro de recuperos.

### 8.1. Caja y Conceptos

| Método | Endpoint                 | Parámetros / Body                     | Respuesta               | Descripción                                                    |
|:-------|:-------------------------|:--------------------------------------|:------------------------|:---------------------------------------------------------------|
| `POST` | `/finanzas/conceptos`    | **Body:** `ConceptoGastoDTO`          | `String`                | Crea un nuevo concepto/categoría de egreso o gasto.            |
| `GET`  | `/finanzas/conceptos`    | **Query:** `page` (int), `size` (int) | `Page<GetConceptosDTO>` | Lista paginada de todos los conceptos de gasto configurados.   |
| `GET`  | `/finanzas/cajas/actual` | *Ninguno*                             | `GetCajaDTO`            | Consulta el saldo global y balance de la caja actual.          |
| `GET`  | `/finanzas/arbitros`     | **Query:** `page` (int), `size` (int) | `Page<GetArbitroDTO>`   | Lista árbitros junto a su estado general y balances contables. |

### 8.2. Gastos

| Método | Endpoint                                 | Parámetros / Body                                                             | Respuesta                    | Descripción                                                              |
|:-------|:-----------------------------------------|:------------------------------------------------------------------------------|:-----------------------------|:-------------------------------------------------------------------------|
| `POST` | `/finanzas/gastos`                       | **Body:** `GastoDTO`                                                          | `GetGastoDTO`                | Registra un nuevo gasto/egreso en el sistema.                            |
| `PUT`  | `/finanzas/gastos/{idGasto}`             | **Path:** `idGasto` (Long)<br>**Body:** `GastoDTO`                            | `GetGastoDTO`                | Actualiza la información de un gasto existente.                          |
| `POST` | `/finanzas/gastos/asociar-gasto-arbitro` | **Query:** `idGasto` (Long), `idArbitro` (Long), `montoAsignado` (BigDecimal) | `String`                     | Asocia e imputa un gasto particular a la cuenta corriente de un árbitro. |
| `POST` | `/finanzas/gastos/asignar-arbitros`      | **Query:** `idGasto` (Long), `montoAasignar` (BigDecimal)                     | `String`                     | Distribuye un gasto entre el grupo de últimos árbitros designados.       |
| `GET`  | `/finanzas/gastos/{idGasto}/reporte`     | **Path:** `idGasto` (Long)                                                    | `byte[]` (`application/pdf`) | Genera y descarga el comprobante en PDF con el detalle del gasto.        |

### 8.3. Préstamos

| Método | Endpoint                                                 | Parámetros / Body                                                                           | Respuesta                     | Descripción                                                           |
|:-------|:---------------------------------------------------------|:--------------------------------------------------------------------------------------------|:------------------------------|:----------------------------------------------------------------------|
| `POST` | `/finanzas/prestamos`                                    | **Body:** `PrestamoDTO`                                                                     | `GetPrestamoDTO`              | Registra la entrega de un préstamo a un árbitro.                      |
| `GET`  | `/finanzas/prestamos`                                    | **Query:** `page` (int), `size` (int)                                                       | `Page<GetPrestamoDTO>`        | Lista paginada de todos los préstamos solicitados y otorgados.        |
| `GET`  | `/finanzas/prestamos/{idPrestamo}`                       | **Path:** `idPrestamo` (Long)                                                               | `GetPrestamoDTO`              | Obtiene el resumen del préstamo identificado por su ID.               |
| `POST` | `/finanzas/prestamos/{prestamoId}/pago`                  | **Path:** `prestamoId` (Long)<br>**Query:** `montoPagado` (BigDecimal), `fecha` (LocalDate) | `GetPrestamoDTO`              | Registra una entrega/pago parcial o total de la deuda del préstamo.   |
| `PUT`  | `/finanzas/prestamos/{idPrestamo}/actualizar-fecha`      | **Path:** `idPrestamo` (Long)<br>**Query:** `nuevaFecha` (LocalDate)                        | `GetPrestamoDTO`              | Modifica la fecha de solicitud registrada para el préstamo.           |
| `PUT`  | `/finanzas/prestamos/{idPrestamo}/actualizar-fecha-pago` | **Path:** `idPrestamo` (Long)<br>**Query:** `nuevaFecha` (LocalDate)                        | `GetPrestamoDTO`              | Modifica la fecha de vencimiento o pacto de pago del préstamo.        |
| `GET`  | `/finanzas/prestamos/reporte`                            | *Ninguno*                                                                                   | `byte[]` (`application/pdf`)  | Genera y descarga el reporte general consolidado de préstamos en PDF. |
| `GET`  | `/finanzas/prestamos/arbitro/{idArbitro}`                | **Path:** `idArbitro` (Long)<br>**Query:** `page` (int), `size` (int)                       | `Page<GetPrestamoDTO>`        | Lista los préstamos asociados a un árbitro específico.                |
| `GET`  | `/finanzas/prestamos/{idPrestamo}/detalle`               | **Path:** `idPrestamo` (Long)<br>**Query:** `page` (int), `size` (int)                      | `Page<GetDetallePrestamoDTO>` | Retorna el historial de amortizaciones y pagos de un préstamo.        |

### 8.4. Transacciones y Gastos con Recupero

| Método | Endpoint                                                       | Parámetros / Body                                                                              | Respuesta                             | Descripción                                                                   |
|:-------|:---------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|:--------------------------------------|:------------------------------------------------------------------------------|
| `GET`  | `/finanzas/transacciones`                                      | **Query:** `page` (int), `size` (int)                                                          | `Page<GetTransaccionesDTO>`           | Lista cronológica y paginada de movimientos y transacciones de caja.          |
| `GET`  | `/finanzas/transacciones/{idTransaccion}`                      | **Path:** `idTransaccion` (Long)                                                               | `GetTransaccionesDTO`                 | Obtiene el detalle completo de una transacción por su ID.                     |
| `GET`  | `/finanzas/gastos-con-recupero`                                | **Query:** `page` (int, default: 0), `size` (int, default: 20)                                 | `Page<GetDetalleTransaccionGastoDTO>` | Lista paginada de gastos que requieren recupero de fondos.                    |
| `GET`  | `/finanzas/gastos-con-recupero/todos`                          | *Ninguno*                                                                                      | `List<GetDetalleTransaccionGastoDTO>` | Lista completa (sin paginación) de todos los gastos con recupero pendientes.  |
| `GET`  | `/finanzas/gastos-con-recupero/{idTransaccion}`                | **Path:** `idTransaccion` (Long)                                                               | `GetDetalleTransaccionGastoDTO`       | Obtiene el detalle y estado de cobro de un gasto con recupero específico.     |
| `POST` | `/finanzas/gastos-con-recupero/{idTransaccion}/realizar-cobro` | **Path:** `idTransaccion` (Long)<br>**Query:** `idArbitro` (Long), `montoCobrado` (BigDecimal) | `String`                              | Registra el cobro efectuado a un árbitro por un gasto con recupero pendiente. |

---

## 9. Automatización (`/api/automation`)

Endpoints para la ejecución de algoritmos de asignación automática, sincronización y simulaciones.

| Método | Endpoint                                             | Parámetros / Body                                                                                                                    | Respuesta             | Descripción                                                                                              |
|:-------|:-----------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------|:----------------------|:---------------------------------------------------------------------------------------------------------|
| `POST` | `/api/automation/importar-snapshot-prod`             | *Ninguno*                                                                                                                            | `Map<String, Object>` | Importa y sincroniza un snapshot de base de datos desde el entorno de producción.                        |
| `POST` | `/api/automation/aleatorizar-viaje`                  | *Ninguno*                                                                                                                            | `Map<String, Object>` | Modifica aleatoriamente propiedades de transporte/viaje para tests de asignación.                        |
| `POST` | `/api/automation/fase1`                              | **Query:** `fechaViernes` (LocalDate, opcional)                                                                                      | `Map<String, String>` | Ejecuta la **Fase 1** (generación de designaciones base para el fin de semana).                          |
| `POST` | `/api/automation/fase3`                              | **Query:** `fechaViernes` (LocalDate, opcional)                                                                                      | `Map<String, String>` | Ejecuta la **Fase 3** (barrido final, resolución de vacantes y cierre de asignaciones).                  |
| `POST` | `/api/automation/simular-disponibilidad/{idArbitro}` | **Path:** `idArbitro` (Long)<br>**Query:** `disponibleSabado` (Boolean, default: true), `disponibleDomingo` (Boolean, default: true) | `Map<String, String>` | Simula la confirmación de disponibilidad de un árbitro y dispara el evento de asignación en tiempo real. |
| `POST` | `/api/automation/toggle-ventana`                     | **Query:** `activa` (Boolean, opcional)                                                                                              | `Map<String, Object>` | Fuerza o pausa manualmente la ventana temporal durante la cual la asignación automática opera.           |
| `GET`  | `/api/automation/estado`                             | *Ninguno*                                                                                                                            | `Map<String, Object>` | Retorna el estado actual del cron de automatización y las fases ejecutadas.                              |

---

## 10. Notificaciones (`/api/notificaciones`)

Transmisión de eventos en tiempo real hacia el cliente web.

| Método | Endpoint                        | Parámetros / Body | Respuesta                          | Descripción                                                                                              |
|:-------|:--------------------------------|:------------------|:-----------------------------------|:---------------------------------------------------------------------------------------------------------|
| `GET`  | `/api/notificaciones/subscribe` | *Ninguno*         | `SseEmitter` (`text/event-stream`) | Establece una conexión SSE (Server-Sent Events) para recibir notificaciones y cambios de estado en vivo. |
