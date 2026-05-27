package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetTransaccionesDTO;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class TransaccionesController {
    private final FinanzasService finanzasService;

    @GetMapping(value = "/transacciones", name = "Traer Transacciones")
    public ResponseEntity<Page<GetTransaccionesDTO>> traerTransacciones(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerTransacciones(page, size));
    }
}
