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

@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class FinanzasController {
    private final FinanzasService finanzasService;
    private final ArbitroService arbitroService;

    @PostMapping(value = "/prestamos", name = "Registrar Prestamo")
    public ResponseEntity<GetPrestamoDTO> registrarPrestamo(@RequestBody PrestamoDTO prestamoDTO) {
        return ResponseEntity.ok(finanzasService.registrarPrestamo(prestamoDTO.getArbitro(), prestamoDTO.getMontoSolicitado()));
    }

    @GetMapping(value = "/prestamos", name = "Traer Prestamos")
    public ResponseEntity<Page<GetPrestamoDTO>> traerPrestamos(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerPrestamos(page, size));
    }

    @GetMapping(value = "/prestamos/{idPrestamo}", name = "Traer un prestamo")
    public ResponseEntity<GetPrestamoDTO> traer(@PathVariable Long idPrestamo) {
        return ResponseEntity.ok(finanzasService.traerPorId(idPrestamo));
    }

    @PostMapping(value = "/prestamos/{prestamoId}/pago", name = "Registrar Pago de Prestamo")
    public ResponseEntity<GetPrestamoDTO> registrarPagoPrestamo(@PathVariable Long prestamoId, @RequestParam BigDecimal montoPagado) {
        return ResponseEntity.ok(finanzasService.registrarPagoPrestamo(prestamoId, montoPagado));
    }

    @PostMapping(value = "/conceptos", name = "Crear conceptos de gastos")
    public ResponseEntity<String> crearConceptoGasto(@RequestBody ConceptoGastoDTO nuevoConcepto) {
        return ResponseEntity.ok(finanzasService.crearConcepto(nuevoConcepto));
    }

    @PostMapping(value = "/gastos", name = "Registrar Nuevo Gasto")
    public ResponseEntity<GetGastoDTO> registrarGasto(@RequestBody GastoDTO gasto) {
        return ResponseEntity.ok(finanzasService.registrarGasto(gasto));
    }

    @GetMapping(value = "/conceptos", name = "Traer Conceptos")
    public ResponseEntity<Page<GetConceptosDTO>> obtenerConceptos(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerConceptos(page, size));
    }

    @GetMapping(value = "/prestamos/arbitro/{idArbitro}", name = "Traer Prestamos por Arbitro")
    public ResponseEntity<Page<GetPrestamoDTO>> traerPrestamosPorArbitro(@PathVariable Long idArbitro, @RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerPrestamosPorArbitro(idArbitro, page, size));
    }

    @GetMapping(value = "/cajas/actual", name = "Traer Caja Actual")
    public ResponseEntity<GetCajaDTO> obtenerCajas() {
        return ResponseEntity.ok(finanzasService.traerCajaActual());
    }

    @GetMapping(value = "/arbitros", name = "Traer todos los arbitros")
    public ResponseEntity<Page<GetArbitroDTO>> traerArbitros(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.traerTodos(page, size));
    }

    @GetMapping(value = "/transacciones", name = "Traer Transacciones")
    public ResponseEntity<Page<GetTransaccionesDTO>> traerTransacciones(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerTransacciones(page, size));
    }
}