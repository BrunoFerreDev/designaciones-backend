package com.designaciones.webdesignaciones.dto.get;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetEstadisticasDTO {
    private BigDecimal totalPrestamos;
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;

}
