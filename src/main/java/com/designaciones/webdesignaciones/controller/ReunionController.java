package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDisponibilidadFinDeSemanaDTO;
import com.designaciones.webdesignaciones.dto.get.GetReunionDetalleDTO;
import com.designaciones.webdesignaciones.dto.get.GetReunionResumenDTO;
import com.designaciones.webdesignaciones.dto.post.CrearReunionDTO;
import com.designaciones.webdesignaciones.dto.post.RegistrarAsistenciaBatchDTO;
import com.designaciones.webdesignaciones.dto.post.TemaReunionDTO;
import com.designaciones.webdesignaciones.service.ReunionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/reuniones")
@RequiredArgsConstructor
public class ReunionController {

    private final ReunionService reunionService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PostMapping(name = "Crea una nueva reunión arbitral")
    public ResponseEntity<GetReunionDetalleDTO> crearReunion(@RequestBody CrearReunionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reunionService.crearReunion(dto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(name = "Lista todas las reuniones con resumen liviano")
    public ResponseEntity<Page<GetReunionResumenDTO>> obtenerReuniones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reunionService.obtenerReuniones(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/{idReunion}", name = "Obtiene detalle completo de la reunión con temas y asistencias")
    public ResponseEntity<GetReunionDetalleDTO> obtenerDetalleReunion(@PathVariable Long idReunion) {
        return ResponseEntity.ok(reunionService.obtenerDetalleReunion(idReunion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PutMapping(value = "/{idReunion}", name = "Actualiza datos generales de la reunión")
    public ResponseEntity<GetReunionDetalleDTO> actualizarReunion(
            @PathVariable Long idReunion,
            @RequestBody CrearReunionDTO dto) {
        return ResponseEntity.ok(reunionService.actualizarReunion(idReunion, dto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @DeleteMapping(value = "/{idReunion}", name = "Elimina una reunión")
    public ResponseEntity<String> eliminarReunion(@PathVariable Long idReunion) {
        reunionService.eliminarReunion(idReunion);
        return ResponseEntity.ok("Reunión eliminada correctamente");
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PutMapping(value = "/{idReunion}/temas", name = "Actualiza la lista de temas tratados")
    public ResponseEntity<GetReunionDetalleDTO> actualizarTemas(
            @PathVariable Long idReunion,
            @RequestBody List<TemaReunionDTO> temas) {
        return ResponseEntity.ok(reunionService.actualizarTemas(idReunion, temas));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PostMapping(value = "/{idReunion}/asistencia", name = "Registra asistencia y disponibilidad en lote")
    public ResponseEntity<GetReunionDetalleDTO> registrarAsistenciasBatch(
            @PathVariable Long idReunion,
            @RequestBody RegistrarAsistenciaBatchDTO dto) {
        return ResponseEntity.ok(reunionService.registrarAsistenciasBatch(idReunion, dto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/{idReunion}/disponibilidad-finde", name = "Reporte de disponibilidad de árbitros para el fin de semana de la reunión")
    public ResponseEntity<GetDisponibilidadFinDeSemanaDTO> obtenerDisponibilidadFinDeSemana(@PathVariable Long idReunion) {
        return ResponseEntity.ok(reunionService.obtenerDisponibilidadFinDeSemana(idReunion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR', 'ARBITRO')")
    @GetMapping(value = "/buscar", name = "Busca reuniones por fecha y lugar")
    public ResponseEntity<List<GetReunionResumenDTO>> buscarReuniones(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        return ResponseEntity.ok(reunionService.buscarReuniones(fechaInicio, fechaFin, page, size));
    }
}
