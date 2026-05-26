package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.service.DesignadosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/designados")
@RequiredArgsConstructor
public class DesignadosController {
    private final DesignadosService designadosService;

    @GetMapping
    public ResponseEntity<List<GetDesignadosDTO>> obtenerTodosDesignados(@RequestParam Long idDesignacion) {
        return ResponseEntity.ok(designadosService.obtenerTodosDesignados(idDesignacion));
    }

    @DeleteMapping(value = "/eliminar-designado")
    public ResponseEntity<Void> eliminarDesignado(@RequestParam Long idDesignacion, @RequestParam Long idDesignado) {
        designadosService.eliminarDesignado(idDesignacion, idDesignado);
        return ResponseEntity.noContent().build();
    }
}
