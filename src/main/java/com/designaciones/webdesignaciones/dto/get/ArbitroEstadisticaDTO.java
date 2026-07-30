package com.designaciones.webdesignaciones.dto.get;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArbitroEstadisticaDTO {
    private Long idArbitro;
    private String nombreCompleto;
    private int totalDesignaciones;
    private int totalPartidosDirigidos;
    private BigDecimal totalMontoPercibido;
}
