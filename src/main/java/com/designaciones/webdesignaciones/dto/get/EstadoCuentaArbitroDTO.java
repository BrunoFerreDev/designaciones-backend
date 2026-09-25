package com.designaciones.webdesignaciones.dto.get;

import java.math.BigDecimal;
import java.util.List;

public record EstadoCuentaArbitroDTO(
        Long idArbitro,
        String nombreCompleto,
        BigDecimal totalDeudaPrestamos,
        int prestamosActivosCount,
        List<GetPrestamoDTO> prestamosPendientes,
        BigDecimal totalGastosConRecuperoPendientes
) {}
