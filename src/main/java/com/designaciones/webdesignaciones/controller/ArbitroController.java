package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.GetArbitroDTO;
import com.designaciones.webdesignaciones.service.ArbitroService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/arbitros")
@RequiredArgsConstructor
public class ArbitroController {
    private final ArbitroService arbitroService;


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
}
