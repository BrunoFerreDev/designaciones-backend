package com.designaciones.webdesignaciones.event;

import org.springframework.context.ApplicationEvent;

public class ArbitroDisponibleEvent extends ApplicationEvent {

    private final Long idArbitro;
    private final Boolean disponibleSabado;
    private final Boolean disponibleDomingo;

    public ArbitroDisponibleEvent(Object source, Long idArbitro, Boolean disponibleSabado, Boolean disponibleDomingo) {
        super(source);
        this.idArbitro = idArbitro;
        this.disponibleSabado = disponibleSabado;
        this.disponibleDomingo = disponibleDomingo;
    }

    public Long getIdArbitro() {
        return idArbitro;
    }

    public Boolean getDisponibleSabado() {
        return disponibleSabado;
    }

    public Boolean getDisponibleDomingo() {
        return disponibleDomingo;
    }
}
