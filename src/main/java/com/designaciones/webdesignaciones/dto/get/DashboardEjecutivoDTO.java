package com.designaciones.webdesignaciones.dto.get;

import java.math.BigDecimal;

public record DashboardEjecutivoDTO(
        BigDecimal saldoCajaActual,
        BigDecimal ingresosMes,
        BigDecimal egresosMes,
        BigDecimal balanceMes,
        BigDecimal totalPrestamosPorCobrar,
        BigDecimal totalGastosRecuperoPorCobrar,
        long cantidadPartidosMes,
        BigDecimal totalArancelesAbonados,
        int arbitrosActivos,
        int arbitrosDisponiblesFinDeSemana
) {}
