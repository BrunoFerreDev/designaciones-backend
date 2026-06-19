package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@Getter
public class GetDesignacionDTO {
    private Long idDesignacion;
    private LocalDateTime fecha;
    private GetCanchaDTO cancha;
    private EtapaCampeonato etapaCampeonato;
    private Integer cantidadPartidos;
    private int estadoDesignacion; // 0: Pendiente a completar, 1: Completa, 2: Jornada finalizada
    private List<GetDesignadosDTO> arbitrosDesignados;

    public GetDesignacionDTO(Designacion designacion, List<Designados> designados) {
        this.idDesignacion = designacion.getIdDesignacion();
        this.fecha = designacion.getFecha();
        this.cancha = new GetCanchaDTO(designacion.getCancha());
        this.etapaCampeonato = designacion.getEtapaCampeonato();
        ;
        this.cantidadPartidos = designacion.getCantidadPartidos();
        this.arbitrosDesignados = designados.stream().map(GetDesignadosDTO::new).collect(Collectors.toList());
        this.estadoDesignacion = designacion.getEstadoDesignacion();
    }


    public GetDesignacionDTO(Designacion designacion) {
        this.idDesignacion = designacion.getIdDesignacion();
        this.fecha = designacion.getFecha();
        this.cancha = new GetCanchaDTO(designacion.getCancha());
        this.etapaCampeonato = designacion.getEtapaCampeonato();
        this.cantidadPartidos = designacion.getCantidadPartidos();
        this.arbitrosDesignados = new ArrayList<>();
        this.estadoDesignacion = designacion.getEstadoDesignacion();
    }
}
