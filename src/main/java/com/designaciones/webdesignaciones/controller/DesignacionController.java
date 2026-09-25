package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetComparacionEstadisticasArbitrosDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasArbitroDetalleDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasDesignacionesDTO;
import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.service.DesignacionEstadisticasService;
import com.designaciones.webdesignaciones.service.DesignacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping(value = "/designaciones")
@RequiredArgsConstructor
public class DesignacionController {

    private final DesignacionService designacionService;
    private final DesignacionEstadisticasService designacionEstadisticasService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PostMapping(name = "Crear Designacion")
    public ResponseEntity<GetDesignacionDTO> crearDesignacion(@RequestBody DesignacionDTO designacionDTO) {
        return ResponseEntity.ok(designacionService.crearDesignacion(designacionDTO));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignacion}", name = "Actualizar Designacion")
    public ResponseEntity<GetDesignacionDTO> actualizarDesignacion(@PathVariable Long idDesignacion, @RequestBody DesignacionDTO designacionDTO) {
        return ResponseEntity.ok(designacionService.actualizarDesignacion(idDesignacion, designacionDTO));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/{idDesignacion}", name = "Traer por id")
    public ResponseEntity<GetDesignacionDTO> traerPorId(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.obtenerPorId(idDesignacion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PostMapping(value = "/{idDesignacion}/sincronizar-arancel", name = "Vincular Arancel")
    public ResponseEntity<String> vincularArancel(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.sincronizarArancel(idDesignacion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/mes", name = "Obtener Designaciones por Mes")
    public ResponseEntity<List<GetDesignacionDTO>> obtenerDesignacionesPorMes(@RequestParam int mes, @RequestParam int anio) {
        return ResponseEntity.ok(designacionService.obtenerPorMes(mes, anio));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignacion}/cambiar-cancelado", name = "Jornada Cancelada")
    public ResponseEntity<GetDesignacionDTO> cambiarEstadoDesignacion(@PathVariable Long idDesignacion, @RequestParam(required = false) String detalle) {
        return ResponseEntity.ok(designacionService.cambiarEstadoDesignacion(idDesignacion, detalle));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/buscar")
    public ResponseEntity<List<GetDesignacionDTO>> buscarDesignaciones(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        if (fecha != null) {
            return ResponseEntity.ok(designacionService.obtenerPorFecha(fecha));
        }
        LocalDate fInicio = inicio != null ? inicio : LocalDate.now();
        LocalDate fFin = fin != null ? fin : fInicio;
        return ResponseEntity.ok(designacionService.buscarPorFechas(fInicio.atStartOfDay(), fFin.atTime(LocalTime.MAX)));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(name = "Obtener por estado ")
    public ResponseEntity<Page<GetDesignacionDTO>> obtenerDesignacionesPorCompletar(
            @RequestParam(defaultValue = "1") int estado,
            @RequestParam int page,
            @RequestParam int size) {
        return ResponseEntity.ok(designacionService.obtenerPorEstado(estado, page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignacion}/finalizar", name = "Finalizar Designacion")
    public ResponseEntity<GetDesignacionDTO> finalizarDesignacion(@PathVariable Long idDesignacion, @RequestParam(required = false) String detalle) {
        return ResponseEntity.ok(designacionService.finalizarDesignacion(idDesignacion, detalle));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignacion}/aceptar", name = "Aceptar Designacion")
    public ResponseEntity<GetDesignacionDTO> aceptarDesignacion(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.aceptarDesignacion(idDesignacion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignacion}/reprogramar", name = "Reprogramar designacion")
    public ResponseEntity<GetDesignacionDTO> reprogramarDesignacion(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.reprogramarDesignacion(idDesignacion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PostMapping(value = "/{idDesignacion}/arbitros", name = "Asignar Arbitro a Designacion")
    public ResponseEntity<GetDesignacionDTO> asignarArbitroADesignacion(
            @PathVariable Long idDesignacion,
            @RequestParam Long idArbitro,
            @RequestParam(required = false, defaultValue = "false") boolean forzar,
            @RequestParam(required = false, defaultValue = "false") boolean historico) {
        if (historico) {
            return ResponseEntity.ok(designacionService.asignarArbitroHistoricoADesignacion(idDesignacion, idArbitro));
        } else if (forzar) {
            return ResponseEntity.ok(designacionService.forzarAsignarArbitroADesignacion(idDesignacion, idArbitro));
        } else {
            return ResponseEntity.ok(designacionService.asignarArbitroADesignacion(idDesignacion, idArbitro));
        }
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @DeleteMapping(value = "/{idDesignacion}/arbitros/{idArbitro}", name = "Quitar Arbitro de Designacion")
    public ResponseEntity<GetDesignacionDTO> quitarArbitroDeDesignacion(@PathVariable Long idDesignacion, @PathVariable Long idArbitro) {
        return ResponseEntity.ok(designacionService.quitarArbitroDeDesignacion(idDesignacion, idArbitro));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @DeleteMapping(value = "/{idDesignacion}", name = "Eliminar Designacion")
    public ResponseEntity<Void> eliminarDesignacion(@PathVariable Long idDesignacion) {
        designacionService.eliminarDesignacion(idDesignacion);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PostMapping(value = "/{idDesignacion}/arbitros/bulk", name = "Designar Lista de Arbitros a Designacion")
    public ResponseEntity<GetDesignacionDTO> designarListaArbitrosADesignacion(@PathVariable Long idDesignacion, @RequestBody List<Long> idsArbitros) {
        return ResponseEntity.ok(designacionService.designarListaArbitrosADesignacion(idDesignacion, idsArbitros));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/estadisticas", name = "Obtener Estadísticas de Designaciones")
    public ResponseEntity<GetEstadisticasDesignacionesDTO> obtenerEstadisticas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false, defaultValue = "DESC") String orden) {
        LocalDate fechaInicio = inicio != null ? inicio : LocalDate.now().withDayOfMonth(1);
        LocalDate fechaFin = fin != null ? fin : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        LocalDateTime start = fechaInicio.atStartOfDay();
        LocalDateTime end = fechaFin.atTime(LocalTime.MAX);
        return ResponseEntity.ok(designacionEstadisticasService.obtenerEstadisticas(start, end, orden));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/estadisticas/arbitro/{idArbitro}", name = "Obtener Estadísticas de Designaciones por Árbitro")
    public ResponseEntity<GetEstadisticasArbitroDetalleDTO> obtenerEstadisticasArbitro(
            @PathVariable Long idArbitro,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false, defaultValue = "DESC") String orden,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        LocalDate fechaInicio = inicio != null ? inicio : LocalDate.now().withDayOfMonth(1);
        LocalDate fechaFin = fin != null ? fin : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        LocalDateTime start = fechaInicio.atStartOfDay();
        LocalDateTime end = fechaFin.atTime(LocalTime.MAX);
        return ResponseEntity.ok(designacionEstadisticasService.obtenerEstadisticasArbitro(idArbitro, start, end, orden, page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'DESIGNADOR')")
    @GetMapping(value = "/estadisticas/comparacion", name = "Obtener Estadísticas Comparativas de Árbitros")
    public ResponseEntity<GetComparacionEstadisticasArbitrosDTO> obtenerEstadisticasComparativas(
            @RequestParam List<Long> idsArbitros,
            @RequestParam(required = false, defaultValue = "1") int mesInicio,
            @RequestParam(required = false, defaultValue = "12") int mesFin) {
        return ResponseEntity.ok(designacionEstadisticasService.obtenerEstadisticasComparativas(idsArbitros, mesInicio, mesFin));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/ultimas-designaciones", name = "Obtener las últimas designaciones")
    public ResponseEntity<List<GetDesignacionDTO>> obtenerUltimasDesignaciones() {
        return ResponseEntity.ok(designacionService.obtenerUltimasDesignaciones());
    }
}
