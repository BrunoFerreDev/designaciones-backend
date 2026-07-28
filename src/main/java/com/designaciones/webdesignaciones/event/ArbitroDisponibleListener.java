package com.designaciones.webdesignaciones.event;

import com.designaciones.webdesignaciones.service.DesignacionAutomationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ArbitroDisponibleListener {

    private static final Logger log = LoggerFactory.getLogger(ArbitroDisponibleListener.class);

    private final DesignacionAutomationService automationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleArbitroDisponibleEvent(ArbitroDisponibleEvent event) {
        log.info("[EVENT LISTENER] Evento ArbitroDisponibleEvent recibido para árbitro ID: {} (Sáb: {}, Dom: {})",
                event.getIdArbitro(), event.getDisponibleSabado(), event.getDisponibleDomingo());

        try {
            automationService.procesarEventoArbitroDisponible(
                    event.getIdArbitro(),
                    event.getDisponibleSabado(),
                    event.getDisponibleDomingo()
            );
        } catch (Exception e) {
            log.error("[EVENT LISTENER] Error al procesar evento de disponibilidad para árbitro ID {}: {}",
                    event.getIdArbitro(), e.getMessage(), e);
        }
    }
}
