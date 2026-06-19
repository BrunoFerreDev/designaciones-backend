package com.designaciones.webdesignaciones.dto.get;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanchaEstadisticaDTO {
    private Long idCancha;
    private String nombreCancha;
    private int totalDesignaciones;
    private int totalPartidos;
    private int totalDesignacionesFinalizadas;
}
