package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.event.ArbitroDisponibleEvent;
import com.designaciones.webdesignaciones.service.DatabaseSyncService;
import com.designaciones.webdesignaciones.service.DesignacionAutomationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/automation")
@RequiredArgsConstructor
public class AutomationController {

    private static final Logger log = LoggerFactory.getLogger(AutomationController.class);

    private final DesignacionAutomationService automationService;
    private final DatabaseSyncService databaseSyncService;
    private final ApplicationEventPublisher eventPublisher;

    @PostMapping("/importar-snapshot-prod")
    public ResponseEntity<Map<String, Object>> importarSnapshotProd() {
        try {
            Map<String, Object> resultado = databaseSyncService.importarSnapshotDesdeProd();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /importar-snapshot-prod: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/aleatorizar-viaje")
    public ResponseEntity<Map<String, Object>> aleatorizarViaje() {
        try {
            Map<String, Object> resultado = databaseSyncService.aleatorizarPropiedadesViaje();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /aleatorizar-viaje: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/fase1")
    public ResponseEntity<Map<String, String>> ejecutarFase1(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaViernes) {
        try {
            automationService.generarDesignacionesBaseViernes(fechaViernes);
            return ResponseEntity.ok(Map.of("mensaje", "Fase 1 (Generación Base) ejecutada correctamente"));
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /fase1: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/fase3")
    public ResponseEntity<Map<String, String>> ejecutarFase3(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaViernes) {
        try {
            automationService.ejecutarBarridoFinalYCierre(fechaViernes);
            return ResponseEntity.ok(Map.of("mensaje", "Fase 3 (Barrido Final y Cierre) ejecutada correctamente"));
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /fase3: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/simular-disponibilidad/{idArbitro}")
    public ResponseEntity<Map<String, String>> simularDisponibilidad(
            @PathVariable Long idArbitro,
            @RequestParam(defaultValue = "true") Boolean disponibleSabado,
            @RequestParam(defaultValue = "true") Boolean disponibleDomingo) {
        try {
            eventPublisher.publishEvent(new ArbitroDisponibleEvent(this, idArbitro, disponibleSabado, disponibleDomingo));
            return ResponseEntity.ok(Map.of("mensaje", "Evento de disponibilidad simulado para árbitro " + idArbitro));
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /simular-disponibilidad: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/toggle-ventana")
    public ResponseEntity<Map<String, Object>> toggleVentana(@RequestParam(required = false) Boolean activa) {
        try {
            automationService.setOverrideVentana(activa);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Override de ventana actualizado",
                    "ventanaActiva", automationService.isVentanaAsignacionActiva(),
                    "override", String.valueOf(automationService.getOverrideVentana())
            ));
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /toggle-ventana: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> obtenerEstado() {
        try {
            return ResponseEntity.ok(automationService.obtenerEstadoAutomacion());
        } catch (Exception e) {
            log.error("[AUTOMATION API ERROR] Error en /estado: {}", e.getMessage(), e);
            throw e;
        }
    }
}
