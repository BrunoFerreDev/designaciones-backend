package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetArancelDTO;
import com.designaciones.webdesignaciones.record.ArancelDTO;
import com.designaciones.webdesignaciones.service.ArancelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/aranceles", name = "Manejo de araneceles")
@RequiredArgsConstructor
public class ArancelController {
    private final ArancelService arancelService;

    @GetMapping(name = "Traer todos ")
    public ResponseEntity<Page<GetArancelDTO>> traerAranceles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(arancelService.traerAranceles(page, size));
    }

    @PostMapping(name = "Nuevo arancel")
    public ResponseEntity<GetArancelDTO> crearArancel(@RequestBody ArancelDTO arancel) {
        return ResponseEntity.ok(arancelService.crearNuevo(arancel));
    }

    @PutMapping(value = "/actualizar", name = "Actualizar arancel")
    public ResponseEntity<GetArancelDTO> actualizarArancel(@RequestParam Long idArancel, @RequestBody ArancelDTO arancel) {
        return ResponseEntity.ok(arancelService.actualizarArancel(idArancel, arancel));
    }

}
