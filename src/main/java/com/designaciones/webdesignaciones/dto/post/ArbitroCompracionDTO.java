package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.dto.get.DesignacionResumenDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArbitroCompracionDTO {
    private Long idArbitro;
    private String nombreCompleto;
    private int totalDesignaciones;
    private int totalPartidosDirigidos;
    private BigDecimal totalMontoPercibido;
    private Map<String, Integer> designacionesPorEstado;
    private List<DesignacionResumenDTO> designacionesDetalle;
}
