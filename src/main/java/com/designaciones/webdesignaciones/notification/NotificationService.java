package com.designaciones.webdesignaciones.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hora de timeout
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(Map.of("mensaje", "Conexión a notificaciones SSE establecida correctamente.")));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void notificarDesasignacion(String nombreArbitro, String detalleDesignacion) {
        if (emitters.isEmpty()) {
            log.debug("[SSE] No hay clientes conectados para notificar desasignación.");
            return;
        }

        log.info("[SSE] Enviando notificación de desasignación de {} a {} clientes conectados.", nombreArbitro, emitters.size());
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        String mensaje = "El árbitro " + nombreArbitro + " ha sido desasignado de " + detalleDesignacion + " por cambio de disponibilidad.";
        Map<String, Object> payload = Map.of(
                "tipo", "DESASIGNACION_ARBITRO",
                "mensaje", mensaje,
                "timestamp", System.currentTimeMillis()
        );

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("desasignacion")
                        .data(payload));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }
}
