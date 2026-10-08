package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.service.DesignadosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/designados")
@RequiredArgsConstructor
public class DesignadosController {
    private final DesignadosService designadosService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping
    public ResponseEntity<List<GetDesignadosDTO>> obtenerTodosDesignados(@RequestParam Long idDesignacion) {
        return ResponseEntity.ok(designadosService.obtenerTodosDesignados(idDesignacion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @DeleteMapping(value = "/eliminar-designado")
    public ResponseEntity<Void> eliminarDesignado(@RequestParam Long idDesignacion, @RequestParam Long idDesignado) {
        designadosService.eliminarDesignado(idDesignacion, idDesignado);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/{idDesignado}/actualizar-monto-percibido", name = "Actualizar el monto percibido en una designacion")
    public ResponseEntity<String> actualizarMonto(@PathVariable Long idDesignado, @RequestParam BigDecimal nuevoMonto) {
        return ResponseEntity.ok().body(designadosService.actualizarMonto(idDesignado, nuevoMonto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/actualizar-monto-a-designados", name = "Actualizar el monto percibido a todos los designados")
    public ResponseEntity<String> actualizarMontoTotal(@RequestParam Long idDesignacion, @RequestParam BigDecimal montoPorArbitro) {
        return ResponseEntity.ok().body(designadosService.actualizarMontoCompleto(idDesignacion, montoPorArbitro));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'DESIGNADOR')")
    @PutMapping(value = "/actualizar-cantidad-partidos", name = "Asignar cantidad de partidos por arbitro")
    public ResponseEntity<String> asigarCantidad(@RequestParam Long idDesignacion, @RequestParam Long idDesignado, @RequestParam int cantidad) {
        return ResponseEntity.ok(designadosService.actualizarPartidos(idDesignacion, idDesignado, cantidad));
    }
}
