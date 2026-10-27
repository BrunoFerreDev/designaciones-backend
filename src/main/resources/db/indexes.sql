-- ============================================================
-- Script de Creación de Índices para Optimización de Búsquedas
-- Motor: PostgreSQL / Supabase
-- Idempotente (IF NOT EXISTS)
-- ============================================================

-- 1. Tabla: designacion
CREATE INDEX IF NOT EXISTS idx_designacion_fecha
    ON designacion (fecha);

CREATE INDEX IF NOT EXISTS idx_designacion_cancha_fecha_estado
    ON designacion ("idCanchaH", fecha, estado_designacion);

CREATE INDEX IF NOT EXISTS idx_designacion_estado_fecha
    ON designacion (estado_designacion, fecha);

-- 2. Tabla: designados
CREATE INDEX IF NOT EXISTS idx_designados_designacion
    ON designados ("idDesignacionH");

CREATE INDEX IF NOT EXISTS idx_designados_arbitro
    ON designados ("idArbitroH");

CREATE INDEX IF NOT EXISTS idx_designados_arbitro_designacion
    ON designados ("idArbitroH", "idDesignacionH");

-- 3. Tabla: arbitro
CREATE INDEX IF NOT EXISTS idx_arbitro_estado_sistema
    ON arbitro (estado_sistema);

CREATE INDEX IF NOT EXISTS idx_arbitro_disp_sab_dom
    ON arbitro (estado_sistema, disponible_sabado, disponible_domingo);

CREATE INDEX IF NOT EXISTS idx_arbitro_roles_id_rol
    ON arbitro_roles (id_arbitro, rol);

-- 4. Tabla: suspencion
CREATE INDEX IF NOT EXISTS idx_suspencion_arbitro_tipo_fechafin
    ON suspencion ("idArbitroH", tipo_suspencion, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_suspencion_arbitro_cancha
    ON suspencion ("idArbitroH", "idCanchaH");

-- 5. Tabla: transacciones
CREATE INDEX IF NOT EXISTS idx_transaccion_fecha_tipo
    ON transacciones (fecha_transaccion, tipo);

CREATE INDEX IF NOT EXISTS idx_transaccion_caja
    ON transacciones ("idCajaH");

-- 6. Tabla: prestamo
CREATE INDEX IF NOT EXISTS idx_prestamo_arbitro
    ON prestamo (arbitro_id);

CREATE INDEX IF NOT EXISTS idx_prestamo_estado
    ON prestamo (estado);

-- 7. Tabla: deudas_gasto
CREATE INDEX IF NOT EXISTS idx_deuda_gasto_arbitro
    ON deudas_gasto (id_arbitro);

CREATE INDEX IF NOT EXISTS idx_deuda_gasto_estado
    ON deudas_gasto (estado);

-- 8. Tabla: historial_arbitro_designacion
CREATE INDEX IF NOT EXISTS idx_hist_arb_desig_lookup
    ON historial_arbitro_designacion ("idDesignacionH", "idArbitroH", activo);

CREATE INDEX IF NOT EXISTS idx_hist_arb_desig_desig
    ON historial_arbitro_designacion ("idDesignacionH");

-- 9. Tabla: historial_estado_designacion
CREATE INDEX IF NOT EXISTS idx_hist_est_desig_desig_fecha
    ON historial_estado_designacion ("idDesignacionH", fecha_cambio);

-- 10. Tabla: tbl_aranceles
CREATE INDEX IF NOT EXISTS idx_arancel_cancha_activo
    ON tbl_aranceles ("idCanchaH", activo);

CREATE INDEX IF NOT EXISTS idx_arancel_cancha_fecha
    ON tbl_aranceles ("idCanchaH", fecha_vigencia);

-- 11. Tabla: asistencia_reunion
CREATE INDEX IF NOT EXISTS idx_asistencia_reunion_estado
    ON asistencia_reunion (id_reunion, estado_asistencia);

CREATE INDEX IF NOT EXISTS idx_asistencia_arbitro
    ON asistencia_reunion (id_arbitro);
