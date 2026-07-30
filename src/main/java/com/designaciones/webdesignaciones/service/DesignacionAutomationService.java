package com.designaciones.webdesignaciones.service;

import java.time.LocalDate;
import java.util.Map;

public interface DesignacionAutomationService {

    void generarDesignacionesBaseViernes(LocalDate fechaViernes);

    void procesarEventoArbitroDisponible(Long idArbitro, Boolean disponibleSabado, Boolean disponibleDomingo);

    void ejecutarBarridoFinalYCierre(LocalDate fechaViernes);

    boolean isVentanaAsignacionActiva();

    void setOverrideVentana(Boolean override);

    Boolean getOverrideVentana();

    Map<String, Object> obtenerEstadoAutomacion();
}
