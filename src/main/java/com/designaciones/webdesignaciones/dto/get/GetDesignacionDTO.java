package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class GetDesignacionDTO {
    private Long idDesignacion;
    private LocalDateTime fecha;
    private GetCanchaDTO cancha;
    private EtapaCampeonato etapaCampeonato;
    private Integer cantidadPartidos;
    private int estadoDesignacion; // 0: Pendiente a completar, 1: Completa, 2: Jornada finalizada, 3: Cancelada
    private Boolean editable;

    public GetDesignacionDTO(Designacion designacion) {
        this.idDesignacion = designacion.getIdDesignacion();
        this.fecha = designacion.getFecha();
        this.cancha = new GetCanchaDTO(designacion.getCancha());
        this.etapaCampeonato = designacion.getEtapaCampeonato();
        ;
        this.cantidadPartidos = designacion.getCantidadPartidos();
        this.estadoDesignacion = designacion.getEstadoDesignacion();
        this.editable = designacion.getEditable();
    }
}
