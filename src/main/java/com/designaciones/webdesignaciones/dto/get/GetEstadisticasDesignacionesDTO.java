package com.designaciones.webdesignaciones.dto.get;

import lombok.*;

import java.util.List;
import java.util.Map;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GetEstadisticasDesignacionesDTO {
    private int totalDesignaciones;
    private int totalPartidosDirigidos;
    private Map<String, Integer> designacionesPorEstado;
    private List<ArbitroEstadisticaDTO> estadisticasArbitros;
    private List<CanchaEstadisticaDTO> estadisticasCanchas;
    private Map<String, Integer> designacionesPorCategoriaArbitro;
}
