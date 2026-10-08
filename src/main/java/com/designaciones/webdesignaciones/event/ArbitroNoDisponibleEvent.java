package com.designaciones.webdesignaciones.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ArbitroNoDisponibleEvent extends ApplicationEvent {

    private final Long idArbitro;
    private final boolean sabadoNoDisponible;
    private final boolean domingoNoDisponible;

    public ArbitroNoDisponibleEvent(Object source, Long idArbitro, boolean sabadoNoDisponible, boolean domingoNoDisponible) {
        super(source);
        this.idArbitro = idArbitro;
        this.sabadoNoDisponible = sabadoNoDisponible;
        this.domingoNoDisponible = domingoNoDisponible;
    }
}
