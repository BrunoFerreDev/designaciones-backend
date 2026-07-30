package com.designaciones.webdesignaciones.dto.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignacionResumenDTO {
    private Long idDesignacion;
    private LocalDateTime fecha;
    private String nombreCancha;
    private String etapaCampeonato;
    private Integer cantidadPartidos;
    private String estadoDesignacion; // "Pendiente", "Aceptada", "Finalizada", "Cancelada"
    private String categoriaArbitroEnDesignacion;
    private Integer partidosDirigidos;
    private BigDecimal montoPercibido;
}
