package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.SuspencionDTO;
import com.designaciones.webdesignaciones.service.SuspencionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SuspencionController {

    private final SuspencionService suspencionService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/suspenciones", name = "Traer Todas las suspensiones")
    public ResponseEntity<Page<GetSuspencionDTO>> getAllSuspenciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(suspencionService.getAllSuspenciones(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @DeleteMapping(value = "/suspenciones/{idSuspencion}", name = "Elimina una suspencion")
    public ResponseEntity<String> deleteSuspencion(@PathVariable Long idSuspencion) {
        return ResponseEntity.accepted().body(suspencionService.deleteSuspencion(idSuspencion));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR') or (hasRole('ARBITRO') and @securityService.esMismoArbitro(authentication, #idArbitro))")
    @GetMapping(value = "/arbitros/{idArbitro}/suspenciones", name = "Trae todas las suspenciones de un arbitro")
    public ResponseEntity<Page<GetSuspencionDTO>> getSuspencionesByArbitro(
            @PathVariable Long idArbitro,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(suspencionService.traerSuspenciones(idArbitro, page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PostMapping(value = "/arbitros/{idArbitro}/suspenciones", name = "Carga una nueva suspencion a un arbitro")
    public ResponseEntity<GetSuspencionDTO> cargarSuspencion(@RequestBody SuspencionDTO suspencionDTO) {
        return ResponseEntity.ok(suspencionService.cargarSuspencion(suspencionDTO));
    }
}
