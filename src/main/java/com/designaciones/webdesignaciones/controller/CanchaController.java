package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.CanchaDTO;
import com.designaciones.webdesignaciones.dto.GetCanchaDTO;
import com.designaciones.webdesignaciones.service.CanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/canchas", name = "Cancha Controller")
@RequiredArgsConstructor
public class CanchaController {
    private final CanchaService canchaService;

    @GetMapping(name = "Traer todas las canchas")
    public ResponseEntity<Page<GetCanchaDTO>> getAllCanchas(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(canchaService.getAllCanchas(page, size));
    }

    @GetMapping(value = "/activas", name = "Traer canchas activas")
    public ResponseEntity<Page<GetCanchaDTO>> getActiveCanchas(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(canchaService.getActiveCanchas(page, size));
    }

    @PutMapping(value = "/{id}/toggle", name = "Cambiar estado de una cancha")
    public ResponseEntity<Void> toggleCanchaEstado(@PathVariable Long idCancha) {
        try {
            canchaService.toggleCanchaEstado(idCancha);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping(name = "Crear una nueva cancha")
    public ResponseEntity<GetCanchaDTO> createCancha(@RequestBody CanchaDTO canchaDTO) {
        return ResponseEntity.ok(canchaService.createCancha(canchaDTO));
    }
}
