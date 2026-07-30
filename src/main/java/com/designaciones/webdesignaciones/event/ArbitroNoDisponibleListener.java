package com.designaciones.webdesignaciones.event;

import com.designaciones.webdesignaciones.service.ArbitroService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ArbitroNoDisponibleListener {

    private static final Logger log = LoggerFactory.getLogger(ArbitroNoDisponibleListener.class);
    private final ArbitroService arbitroService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleArbitroNoDisponibleEvent(ArbitroNoDisponibleEvent event) {
        log.info("[ASYNC EVENT] Recibido evento ArbitroNoDisponibleEvent para árbitro ID: {} (Sab: {}, Dom: {})",
                event.getIdArbitro(), event.isSabadoNoDisponible(), event.isDomingoNoDisponible());

        try {
            arbitroService.eliminarDesignacionesPorFaltaDeDisponibilidadAsync(
                    event.getIdArbitro(),
                    event.isSabadoNoDisponible(),
                    event.isDomingoNoDisponible()
            );
        } catch (Exception e) {
            log.error("[ASYNC EVENT ERROR] Error al procesar desasignación en segundo plano para árbitro ID {}: {}",
                    event.getIdArbitro(), e.getMessage(), e);
        }
    }
}
