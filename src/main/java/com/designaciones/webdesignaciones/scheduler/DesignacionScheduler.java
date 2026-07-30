package com.designaciones.webdesignaciones.scheduler;

import com.designaciones.webdesignaciones.service.DesignacionAutomationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
public class DesignacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(DesignacionScheduler.class);
    private static final ZoneId ZONA_HORARIA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final DesignacionAutomationService automationService;

    // Fase 1: Viernes a las 21:00 hs - Generación Base
    @Scheduled(cron = "0 0 21 * * FRI", zone = "America/Argentina/Buenos_Aires")
    public void ejecutarFase1GeneracionBaseScheduled() {
        log.info("[CRON SCHEDULER] Disparando Fase 1 (Generación Base) del Viernes a las 21:00 hs");
        automationService.generarDesignacionesBaseViernes(LocalDate.now(ZONA_HORARIA));
    }

    // Fase 3: Viernes a las 23:30 hs - Cierre y Barrido Final
    @Scheduled(cron = "0 30 23 * * FRI", zone = "America/Argentina/Buenos_Aires")
    public void ejecutarFase3BarridoFinalScheduled() {
        log.info("[CRON SCHEDULER] Disparando Fase 3 (Cierre y Barrido Final) del Viernes a las 23:30 hs");
        automationService.ejecutarBarridoFinalYCierre(LocalDate.now(ZONA_HORARIA));
    }
}
