package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class FinanzasController {
    private final FinanzasService finanzasService;
    private final ArbitroService arbitroService;

    @PostMapping(value = "/conceptos", name = "Crear conceptos de gastos")
    public ResponseEntity<String> crearConceptoGasto(@RequestBody ConceptoGastoDTO nuevoConcepto) {
        return ResponseEntity.ok(finanzasService.crearConcepto(nuevoConcepto));
    }

    @GetMapping(value = "/conceptos", name = "Traer Conceptos")
    public ResponseEntity<Page<GetConceptosDTO>> obtenerConceptos(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerConceptos(page, size));
    }

    @GetMapping(value = "/cajas/actual", name = "Traer Caja Actual")
    public ResponseEntity<GetCajaDTO> obtenerCajas() {
        return ResponseEntity.ok(finanzasService.traerCajaActual());
    }

    @GetMapping(value = "/arbitros", name = "Traer todos los arbitros")
    public ResponseEntity<Page<GetArbitroDTO>> traerArbitros(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.traerTodos(page, size));
    }




}