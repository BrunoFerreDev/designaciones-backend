package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.SuspencionDTO;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.service.SuspencionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/arbitros")
@RequiredArgsConstructor
public class ArbitroController {


    private final ArbitroService arbitroService;
    private final SuspencionService suspencionService;

    @PostMapping(name = "Crea un nuevo arbitro")
    public ResponseEntity<GetArbitroDTO> createArbitro(@RequestBody ArbitroDTO arbitroDTO) {
        return ResponseEntity.ok(arbitroService.createArbitro(arbitroDTO));
    }

    @PutMapping(value = "/{idArbitro}", name = "Modifica un arbitro")
    public ResponseEntity<GetArbitroDTO> updateArbitro(@PathVariable Long idArbitro, @RequestBody ArbitroDTO arbitroDTO) {
        return ResponseEntity.ok(arbitroService.updateArbitro(idArbitro, arbitroDTO));
    }

    @GetMapping(name = "Trae todos los arbitros")
    public ResponseEntity<Page<GetArbitroDTO>> getAllArbitros(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.getAllArbitros(page, size));
    }

    @PutMapping(value = "/{idArbitro}/actualizar-disponibilidad", name = " Actualiza la disponibilidad de un arbitro")
    public ResponseEntity<GetArbitroDTO> updateArbitroDisponibilidad(@PathVariable Long idArbitro) {
        return ResponseEntity.ok(arbitroService.updateArbitroDisponibilidad(idArbitro));
    }

    @GetMapping(value = "/traer-disponibles", name = "Trae todos los arbitros disponibles")
    public ResponseEntity<Page<GetArbitroDTO>> getDisponibles(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.traerDisponibles(page, size));
    }

    @DeleteMapping(value = "/{idArbitro}", name = "Elimina un arbitro")
    public ResponseEntity<String> deleteArbitro(@PathVariable Long idArbitro) {
        arbitroService.deleteArbitro(idArbitro);
        return ResponseEntity.accepted().body("Arbitro con id " + idArbitro + " eliminado correctamente");
    }

    @PutMapping(value = "/modificar-disponibilidad-total")
    public ResponseEntity<String> modificarDisponibilidadTotal() {
        return ResponseEntity.ok(arbitroService.modificarDisponibilidadTotal());
    }

    @GetMapping(value = "/{idArbitro}/suspenciones", name = "Trae todas las suspenciones de un arbitro")
    public ResponseEntity<Page<GetSuspencionDTO>> getSuspenciones(@PathVariable Long idArbitro, @RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(suspencionService.traerSuspenciones(idArbitro, page, size));
    }

    @PostMapping(value = "/cargar-suspencion", name = "Carga una nueva suspencion a un arbitro")
    public ResponseEntity<GetSuspencionDTO> cargarSuspencion(@RequestBody SuspencionDTO suspencionDTO) {
        return ResponseEntity.ok(suspencionService.cargarSuspencion(suspencionDTO));
    }

    @GetMapping(value = "/suspenciones", name = "Traer Todas")
    public ResponseEntity<Page<GetSuspencionDTO>> getAllSuspenciones(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(suspencionService.getAllSuspenciones(page, size));
    }

    @DeleteMapping(value = "/suspenciones/{idSuspencion}", name = "Elimina una suspencion")
    public ResponseEntity<String> deleteSuspencion(@PathVariable Long idSuspencion) {
        return ResponseEntity.accepted().body(suspencionService.deleteSuspencion(idSuspencion));
    }
}
