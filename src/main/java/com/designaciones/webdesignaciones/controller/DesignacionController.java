package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.service.DesignacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping(value = "/designaciones")
@RequiredArgsConstructor
public class DesignacionController {
    private final DesignacionService designacionService;

    @PostMapping(name = "Crear Designacion")
    public ResponseEntity<GetDesignacionDTO> crearDesignacion(@RequestBody DesignacionDTO designacionDTO) {
        return ResponseEntity.ok(designacionService.crearDesignacion(designacionDTO));
    }

    @GetMapping(value = "/buscar")
    public ResponseEntity<List<GetDesignacionDTO>> buscarDesignaciones(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(designacionService.buscarPorFechas(inicio.atStartOfDay(), fin.atTime(LocalTime.MAX)));
    }

    @GetMapping(value = "/obtener-por-fecha")
    public ResponseEntity<List<GetDesignacionDTO>> obtenerDesignacionesPorFecha(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(designacionService.obtenerPorFecha(fecha));
    }

    @GetMapping(name = "Obtener por estado ")
    public ResponseEntity<List<GetDesignacionDTO>> obtenerDesignacionesPorCompletar(@RequestParam int estado) {
        return ResponseEntity.ok(designacionService.obtenerPorEstado(estado));
    }

    @PutMapping(value = "/{idDesignacion}/finalizar", name = "Finalizar Designacion")
    public ResponseEntity<GetDesignacionDTO> finalizarDesignacion(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.finalizarDesignacion(idDesignacion));
    }

    @PostMapping(value = "/{idDesignacion}/asignar-automatico", name = "Asignar Arbitros Automaticamente")
    public ResponseEntity<GetDesignacionDTO> asignarArbitrosAutomaticamente(@PathVariable Long idDesignacion) {
        return ResponseEntity.ok(designacionService.asignarArbitrosAutomaticamente(idDesignacion));
    }

    @DeleteMapping(value = "/{idDesignacion}/quitar-arbitro/{idArbitro}", name = "Quitar Arbitro de Designacion")
    public ResponseEntity<GetDesignacionDTO> quitarArbitroDeDesignacion(@PathVariable Long idDesignacion, @PathVariable Long idArbitro) {
        return ResponseEntity.ok(designacionService.quitarArbitroDeDesignacion(idDesignacion, idArbitro));
    }

    @PostMapping(value = "/{idDesignacion}/asignar-arbitro", name = "Asignar Arbitro a Designacion")
    public ResponseEntity<GetDesignacionDTO> asignarArbitroADesignacion(@PathVariable Long idDesignacion, @RequestBody Long idArbitro) {
        return ResponseEntity.ofNullable(designacionService.asignarArbitroADesignacion(idDesignacion, idArbitro));
    }

    @DeleteMapping(value = "/{idDesignacion}/eliminar", name = "Eliminar Designacion")
    public ResponseEntity<Void> eliminarDesignacion(@PathVariable Long idDesignacion) {
        designacionService.eliminarDesignacion(idDesignacion);
        return ResponseEntity.noContent().build();
    }

}
