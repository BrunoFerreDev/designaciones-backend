package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.service.CajaService;
import com.designaciones.webdesignaciones.service.FinanzasDashboardService;
import com.designaciones.webdesignaciones.service.GastoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class FinanzasController {

    private final GastoService gastoService;
    private final CajaService cajaService;
    private final ArbitroService arbitroService;
    private final FinanzasDashboardService finanzasDashboardService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/conceptos", name = "Crear conceptos de gastos")
    public ResponseEntity<String> crearConceptoGasto(@RequestBody ConceptoGastoDTO nuevoConcepto) {
        return ResponseEntity.ok(gastoService.crearConcepto(nuevoConcepto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/conceptos", name = "Traer Conceptos")
    public ResponseEntity<Page<GetConceptosDTO>> obtenerConceptos(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(gastoService.traerConceptos(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/cajas/actual", name = "Traer Caja Actual")
    public ResponseEntity<GetCajaDTO> obtenerCajas() {
        return ResponseEntity.ok(cajaService.traerCajaActual());
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/arbitros", name = "Traer todos los arbitros")
    public ResponseEntity<Page<GetArbitroDTO>> traerArbitros(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.traerTodos(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/dashboard-ejecutivo", name = "Dashboard Ejecutivo Financiero")
    public ResponseEntity<DashboardEjecutivoDTO> obtenerDashboardEjecutivo(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio) {
        return ResponseEntity.ok(finanzasDashboardService.obtenerDashboardEjecutivo(mes, anio));
    }
}