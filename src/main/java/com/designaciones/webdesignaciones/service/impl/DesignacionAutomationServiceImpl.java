package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignacionAutomationService;
import com.designaciones.webdesignaciones.service.DesignacionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DesignacionAutomationServiceImpl implements DesignacionAutomationService {

    private static final Logger log = LoggerFactory.getLogger(DesignacionAutomationServiceImpl.class);
    private static final ZoneId ZONA_HORARIA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final DesignacionRepository designacionRepository;
    private final DesignadosRepository designadosRepository;
    private final DesignacionService designacionService;

    private Boolean overrideVentana = null;

    @Override
    @Transactional
    public void generarDesignacionesBaseViernes(LocalDate fechaViernes) {
        LocalDate viernesRef = (fechaViernes != null) ? fechaViernes : LocalDate.now(ZONA_HORARIA);
        LocalDate sabadoObjetivo = viernesRef.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate domingoObjetivo = sabadoObjetivo.plusDays(1);

        log.info("[FASE 1] Iniciando generación base para el fin de semana: Sábado {} - Domingo {}", sabadoObjetivo, domingoObjetivo);

        // Buscar designaciones del fin de semana anterior (base)
        LocalDateTime inicioBusqueda = sabadoObjetivo.minusDays(7).atStartOfDay();
        LocalDateTime finBusqueda = sabadoObjetivo.minusDays(1).atTime(LocalTime.MAX);

        List<Designacion> designacionesBase = designacionRepository.findByFechaBetween(inicioBusqueda, finBusqueda);

        if (designacionesBase.isEmpty()) {
            log.info("[FASE 1] No se encontraron designaciones exactas hace 7 días, buscando últimas designaciones previas...");
            List<Designacion> ultimas = designacionRepository.findAll();
            designacionesBase = ultimas.stream()
                    .filter(d -> d.getFecha() != null && d.getFecha().toLocalDate().isBefore(sabadoObjetivo))
                    .sorted((d1, d2) -> d2.getFecha().compareTo(d1.getFecha()))
                    .limit(20)
                    .toList();
        }

        if (designacionesBase.isEmpty()) {
            log.warn("[FASE 1] No hay designaciones previas disponibles para usar como base.");
            return;
        }

        int creadas = 0;
        for (Designacion base : designacionesBase) {
            if (base.getCancha() == null) continue;

            DayOfWeek diaBase = base.getFecha().getDayOfWeek();
            LocalDate fechaDestino = (diaBase == DayOfWeek.SUNDAY) ? domingoObjetivo : sabadoObjetivo;
            LocalDateTime fechaHoraDestino = LocalDateTime.of(fechaDestino, base.getFecha().toLocalTime());

            List<Designacion> existentes = designacionRepository.findByFechaBetween(
                    fechaHoraDestino.minusMinutes(1),
                    fechaHoraDestino.plusMinutes(1)
            );

            boolean yaExiste = existentes.stream().anyMatch(e -> e.getCancha() != null && e.getCancha().getIdCancha().equals(base.getCancha().getIdCancha()));

            if (!yaExiste) {
                if (base.getEstadoDesignacion() == 3) {
                    designacionService.reprogramarDesignacion(base.getIdDesignacion());
                    log.info("[FASE 1] Designación cancelada ID {} reprogramada para el nuevo fin de semana con sus mismos árbitros", base.getIdDesignacion());
                    creadas++;
                } else {
                    Designacion nueva = Designacion.builder()
                            .fecha(fechaHoraDestino)
                            .cancha(base.getCancha())
                            .cantidadPartidos(base.getCantidadPartidos())
                            .etapaCampeonato(base.getEtapaCampeonato())
                            .estadoDesignacion(0)
                            .editable(true)
                            .detalleExtra("Designación base generada automáticamente")
                            .build();

                    designacionRepository.save(nueva);
                    creadas++;
                }
            }
        }

        log.info("[FASE 1] Generación base completada. Total designaciones creadas: {}", creadas);

        // Intento de asignación inicial automática para árbitros que ya están disponibles
        ejecutarAsignacionProgresivaParaRango(sabadoObjetivo, domingoObjetivo);
    }

    @Override
    @Transactional
    public void procesarEventoArbitroDisponible(Long idArbitro, Boolean disponibleSabado, Boolean disponibleDomingo) {
        if (!isVentanaAsignacionActiva()) {
            log.debug("[FASE 2] Evento disponibilidad ignorado: fuera de la ventana de asignación activa (Viernes 21:00 - 23:30 hs).");
            return;
        }

        log.info("[FASE 2] Procesando asignación reactiva progresiva para árbitro ID {}", idArbitro);

        LocalDate hoy = LocalDate.now(ZONA_HORARIA);
        LocalDate sabadoObjetivo = hoy.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate domingoObjetivo = sabadoObjetivo.plusDays(1);

        ejecutarAsignacionProgresivaParaRango(sabadoObjetivo, domingoObjetivo);
    }

    @Override
    @Transactional
    public void ejecutarBarridoFinalYCierre(LocalDate fechaViernes) {
        LocalDate viernesRef = (fechaViernes != null) ? fechaViernes : LocalDate.now(ZONA_HORARIA);
        LocalDate sabadoObjetivo = viernesRef.with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate domingoObjetivo = sabadoObjetivo.plusDays(1);

        log.info("[FASE 3] Ejecutando barrido final y cierre para fin de semana: {} / {}", sabadoObjetivo, domingoObjetivo);

        ejecutarAsignacionProgresivaParaRango(sabadoObjetivo, domingoObjetivo);

        // Reporte de partidos sin árbitro o incompletos
        LocalDateTime inicio = sabadoObjetivo.atStartOfDay();
        LocalDateTime fin = domingoObjetivo.atTime(LocalTime.MAX);

        List<Designacion> todasFinSemana = designacionRepository.findByFechaBetween(inicio, fin);

        int completas = 0;
        int pendientes = 0;

        for (Designacion d : todasFinSemana) {
            int designadosCount = designadosRepository.findByDesignacion_IdDesignacion(d.getIdDesignacion()).size();
            int necesarios = calcularNecesarios(d.getCantidadPartidos());

            if (designadosCount >= necesarios) {
                completas++;
            } else {
                pendientes++;
                log.warn("[BARRIDO FINAL - REVISIÓN MANUAL REQUERIDA] Designación ID: {} | Cancha: {} | Fecha: {} | Asignados: {}/{}",
                        d.getIdDesignacion(),
                        d.getCancha() != null ? d.getCancha().getNombreCancha() : "N/A",
                        d.getFecha(),
                        designadosCount,
                        necesarios);
            }
        }

        log.info("[FASE 3] Cierre finalizado. Designaciones completas: {}, Requieren revisión manual: {}", completas, pendientes);
    }

    private void ejecutarAsignacionProgresivaParaRango(LocalDate sabado, LocalDate domingo) {
        LocalDateTime inicio = sabado.atStartOfDay();
        LocalDateTime fin = domingo.atTime(LocalTime.MAX);

        List<Designacion> designacionesPendientes = designacionRepository.findByFechaBetween(inicio, fin)
                .stream()
                .filter(d -> d.getEstadoDesignacion() == 0)
                .toList();

        for (Designacion d : designacionesPendientes) {
            try {
                designacionService.asignarArbitrosAutomaticamente(d.getIdDesignacion());
            } catch (Exception e) {
                log.debug("No se pudo completar asignación automática para designación ID {}: {}", d.getIdDesignacion(), e.getMessage());
            }
        }
    }

    private int calcularNecesarios(Integer cantidadPartidos) {
        if (cantidadPartidos == null) return 1;
        return (cantidadPartidos <= 5) ? 2 : 3;
    }

    @Override
    public boolean isVentanaAsignacionActiva() {
        if (overrideVentana != null) {
            return overrideVentana;
        }

        ZonedDateTime now = ZonedDateTime.now(ZONA_HORARIA);
        if (now.getDayOfWeek() != DayOfWeek.FRIDAY) {
            return false;
        }

        LocalTime horaActual = now.toLocalTime();
        LocalTime inicioVentana = LocalTime.of(21, 0);
        LocalTime finVentana = LocalTime.of(23, 30);

        return !horaActual.isBefore(inicioVentana) && !horaActual.isAfter(finVentana);
    }

    @Override
    public void setOverrideVentana(Boolean override) {
        this.overrideVentana = override;
        log.info("Override de ventana de asignación actualizado a: {}", override);
    }

    @Override
    public Boolean getOverrideVentana() {
        return this.overrideVentana;
    }

    @Override
    public Map<String, Object> obtenerEstadoAutomacion() {
        ZonedDateTime now = ZonedDateTime.now(ZONA_HORARIA);
        LocalDate sabadoObjetivo = now.toLocalDate().with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate domingoObjetivo = sabadoObjetivo.plusDays(1);

        LocalDateTime inicio = sabadoObjetivo.atStartOfDay();
        LocalDateTime fin = domingoObjetivo.atTime(LocalTime.MAX);

        List<Designacion> designacionesFinSemana = designacionRepository.findByFechaBetween(inicio, fin);

        Map<String, Object> estado = new LinkedHashMap<>();
        estado.put("horaActual", now.toString());
        estado.put("ventanaAsignacionActiva", isVentanaAsignacionActiva());
        estado.put("overrideVentana", overrideVentana);
        estado.put("sabadoObjetivo", sabadoObjetivo.toString());
        estado.put("domingoObjetivo", domingoObjetivo.toString());
        estado.put("totalDesignacionesFinSemana", designacionesFinSemana.size());
        estado.put("completadas", designacionesFinSemana.stream().filter(d -> d.getEstadoDesignacion() == 1).count());
        estado.put("pendientes", designacionesFinSemana.stream().filter(d -> d.getEstadoDesignacion() == 0).count());

        return estado;
    }
}
