# Documentación de Endpoints

Listado completo de endpoints del backend.

---

## 1. Aranceles (`/aranceles`)

- `GET` `/aranceles` — **params:** `page` (int, default: 0), `size` (int, default: 30)
- `POST` `/aranceles` — **body:** `ArancelDTO`
- `PUT` `/aranceles/actualizar` — **params:** `idArancel` (Long) | **body:** `ArancelDTO`

---

## 2. Árbitros (`/arbitros`)

- `GET` `/arbitros` — **params:** `page` (int), `size` (int)
- `POST` `/arbitros` — **body:** `ArbitroDTO`
- `PUT` `/arbitros/{idArbitro}` — **path:** `idArbitro` (Long) | **body:** `ArbitroDTO`
- `DELETE` `/arbitros/{idArbitro}` — **path:** `idArbitro` (Long)
- `GET` `/arbitros/traer-disponibles` — **params:** `page` (int), `size` (int)
- `GET` `/arbitros/no-disponibles` — **params:** `page` (int), `size` (int)
- `PUT` `/arbitros/{idArbitro}/disponibilidad` — **path:** `idArbitro` (Long) | **body:** `ArbitroDisponibilidadDTO`
- `PUT` `/arbitros/modificar-disponibilidad-total`
- `GET` `/arbitros/{idArbitro}/suspenciones` — **path:** `idArbitro` (Long) | **params:** `page` (int), `size` (int)
- `POST` `/arbitros/{idArbitro}/suspenciones` — **path:** `idArbitro` (Long) | **body:** `SuspencionDTO`
- `GET` `/arbitros/suspenciones` — **params:** `page` (int), `size` (int)
- `DELETE` `/arbitros/suspenciones/{idSuspencion}` — **path:** `idSuspencion` (Long)
- `GET` `/arbitros/designaciones` — **params:** `idArbitro` (Long), `page` (int), `size` (int)

---

## 3. Autenticación (`/auth`)

- `POST` `/auth/login` — **body:** `AuthLogin`
- `POST` `/auth/logout` — **header:** `Authorization: Bearer <token>`

---

## 4. Backups (`/backup`)

- `GET` `/backup/export/json`
- `GET` `/backup/export/sql`
- `POST` `/backup/import/json` — **params:** `file` (MultipartFile)

---

## 5. Canchas (`/canchas`)

- `GET` `/canchas` — **params:** `page` (int), `size` (int)
- `GET` `/canchas/activas` — **params:** `page` (int), `size` (int)
- `POST` `/canchas` — **body:** `CanchaDTO`
- `PUT` `/canchas/{id}/toggle` — **path:** `idCancha` (Long)
- `GET` `/canchas/designaciones` — **params:** `idCancha` (Long), `page` (int), `size` (int)

---

## 6. Designaciones (`/designaciones`)

- `GET` `/designaciones` — **params:** `estado` (int, default: 1), `page` (int), `size` (int) *(0: Pendiente, 1: Aceptada, 2: Finalizada, 3: Cancelada)*
- `POST` `/designaciones` — **body:** `DesignacionDTO`
- `PUT` `/designaciones/{idDesignacion}` — **path:** `idDesignacion` (Long) | **body:** `DesignacionDTO`
- `DELETE` `/designaciones/{idDesignacion}` — **path:** `idDesignacion` (Long)
- `GET` `/designaciones/mes` — **params:** `mes` (int), `anio` (int)
- `GET` `/designaciones/buscar` — **params:** `inicio` (LocalDate `YYYY-MM-DD`), `fin` (LocalDate `YYYY-MM-DD`)
- `GET` `/designaciones/obtener-por-fecha` — **params:** `fecha` (LocalDate `YYYY-MM-DD`)
- `PUT` `/designaciones/{idDesignacion}/cambiar-cancelado` — **path:** `idDesignacion` (Long) | **params:** `detalle` (String)
- `PUT` `/designaciones/{idDesignacion}/finalizar` — **path:** `idDesignacion` (Long)
- `PUT` `/designaciones/{idDesignacion}/aceptar` — **path:** `idDesignacion` (Long)
- `PUT` `/designaciones/{idDesignacion}/reprogramar` — **path:** `idDesignacion` (Long)
- `POST` `/designaciones/{idDesignacion}/asignar-automatico` — **path:** `idDesignacion` (Long)
- `POST` `/designaciones/{idDesignacion}/asignar-arbitro` — **path:** `idDesignacion` (Long) | **params:** `idArbitro` (Long)
- `POST` `/designaciones/{idDesignacion}/asignar-arbitro/historico` — **path:** `idDesignacion` (Long) | **params:** `idArbitro` (Long)
- `DELETE` `/designaciones/{idDesignacion}/arbitros/{idArbitro}` — **path:** `idDesignacion` (Long), `idArbitro` (Long)
- `POST` `/designaciones/{idDesignacion}/arbitros/bulk` — **path:** `idDesignacion` (Long) | **body:** `List<Long>` (idsArbitros)
- `GET` `/designaciones/estadisticas` — **params:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional)
- `GET` `/designaciones/estadisticas/arbitro/{idArbitro}` — **path:** `idArbitro` (Long) | **params:** `inicio` (LocalDate, opcional), `fin` (LocalDate, opcional)
- `GET` `/designaciones/estadisticas/comparacion` — **params:** `idsArbitros` (List<Long>), `mesInicio` (int, default: 1), `mesFin` (int, default: 12)

---

## 7. Designados (`/designados`)

- `GET` `/designados` — **params:** `idDesignacion` (Long)
- `DELETE` `/designados/eliminar-designado` — **params:** `idDesignacion` (Long), `idDesignado` (Long)
- `PUT` `/designados/{idDesignado}/actualizar-monto-percibido` — **path:** `idDesignado` (Long) | **params:** `nuevoMonto` (BigDecimal)
- `PUT` `/designados/actualizar-monto-a-designados` — **params:** `idDesignacion` (Long), `montoPorArbitro` (BigDecimal)

---

## 8. Finanzas (`/finanzas`)

- `GET` `/finanzas/cajas/actual`
- `POST` `/finanzas/conceptos` — **body:** `ConceptoGastoDTO`
- `GET` `/finanzas/conceptos` — **params:** `page` (int), `size` (int)
- `GET` `/finanzas/arbitros` — **params:** `page` (int), `size` (int)
- `POST` `/finanzas/gastos` — **body:** `GastoDTO`
- `PUT` `/finanzas/gastos/{idGasto}` — **path:** `idGasto` (Long) | **body:** `GastoDTO`
- `POST` `/finanzas/gastos/asociar-gasto-arbitro` — **params:** `idGasto` (Long), `idArbitro` (Long), `montoAsignado` (BigDecimal)
- `POST` `/finanzas/gastos/asignar-arbitros` — **params:** `idGasto` (Long), `montoAasignar` (BigDecimal)
- `GET` `/finanzas/gastos/{idGasto}/reporte` — **path:** `idGasto` (Long)
- `GET` `/finanzas/prestamos` — **params:** `page` (int), `size` (int)
- `POST` `/finanzas/prestamos` — **body:** `PrestamoDTO`
- `GET` `/finanzas/prestamos/{idPrestamo}` — **path:** `idPrestamo` (Long)
- `GET` `/finanzas/prestamos/{idPrestamo}/detalle` — **path:** `idPrestamo` (Long) | **params:** `page` (int), `size` (int)
- `GET` `/finanzas/prestamos/arbitro/{idArbitro}` — **path:** `idArbitro` (Long) | **params:** `page` (int), `size` (int)
- `POST` `/finanzas/prestamos/{prestamoId}/pago` — **path:** `prestamoId` (Long) | **params:** `montoPagado` (BigDecimal), `fecha` (LocalDate `YYYY-MM-DD`)
- `PUT` `/finanzas/prestamos/{idPrestamo}/actualizar-fecha` — **path:** `idPrestamo` (Long) | **params:** `nuevaFecha` (LocalDate `YYYY-MM-DD`)
- `PUT` `/finanzas/prestamos/{idPrestamo}/actualizar-fecha-pago` — **path:** `idPrestamo` (Long) | **params:** `nuevaFecha` (LocalDate `YYYY-MM-DD`)
- `GET` `/finanzas/prestamos/reporte`
- `GET` `/finanzas/transacciones` — **params:** `page` (int), `size` (int)
- `GET` `/finanzas/transacciones/{idTransaccion}` — **path:** `idTransaccion` (Long)
- `GET` `/finanzas/gastos-con-recupero` — **params:** `page` (int, default: 0), `size` (int, default: 20)
- `GET` `/finanzas/gastos-con-recupero/todos`
- `GET` `/finanzas/gastos-con-recupero/{idTransaccion}` — **path:** `idTransaccion` (Long)
- `POST` `/finanzas/gastos-con-recupero/{idTransaccion}/realizar-cobro` — **path:** `idTransaccion` (Long) | **params:** `idArbitro` (Long), `montoCobrado` (BigDecimal)
