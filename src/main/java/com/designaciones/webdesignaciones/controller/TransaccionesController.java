package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDetalleTransaccionGastoDTO;
import com.designaciones.webdesignaciones.dto.get.GetTransaccionesDTO;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class TransaccionesController {
    private final FinanzasService finanzasService;

    @GetMapping(value = "/transacciones", name = "Traer Transacciones")
    public ResponseEntity<Page<GetTransaccionesDTO>> traerTransacciones(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerTransacciones(page, size));
    }

    @GetMapping(value = "/transacciones/{idTransaccion}", name = "Traer Transaccion por ID")
    public ResponseEntity<GetTransaccionesDTO> traerTransaccionPorId(@PathVariable Long idTransaccion) {
        return ResponseEntity.ok(finanzasService.traerTransaccionPorId(idTransaccion));
    }

    @GetMapping(value = "/gastos-con-recupero", name = "Traer Gastos que Requieren Recupero (Paginado)")
    public ResponseEntity<Page<GetDetalleTransaccionGastoDTO>> traerTransaccionesGastoConRecupero(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(finanzasService.traerTransaccionesGastoConRecupero(page, size));
    }

    @GetMapping(value = "/gastos-con-recupero/todos", name = "Traer Todos los Gastos que Requieren Recupero")
    public ResponseEntity<List<GetDetalleTransaccionGastoDTO>> traerTodasTransaccionesGastoConRecupero() {
        return ResponseEntity.ok(finanzasService.traerTodasTransaccionesGastoConRecupero());
    }

    @GetMapping(value = "/gastos-con-recupero/{idTransaccion}", name = "Traer Detalle de Gasto con Recupero por ID")
    public ResponseEntity<GetDetalleTransaccionGastoDTO> traerDetalleTransaccionGastoPorId(@PathVariable Long idTransaccion) {
        return ResponseEntity.ok(finanzasService.traerDetalleTransaccionGastoPorId(idTransaccion));
    }

    @PostMapping(value = "/gastos-con-recupero/{idTransaccion}/realizar-cobro", name = "Realizar Cobro de Gasto con Recupero")
    public ResponseEntity<String> realizarCobroGastoConRecupero(@PathVariable Long idTransaccion, @RequestParam Long idArbitro, @RequestParam BigDecimal montoCobrado) {
        try {
            log.debug("Realizando cobro para Transacción ID: {}, Árbitro ID: {}, Monto Cobrado: {}", idTransaccion, idArbitro, montoCobrado);
            String resultado = finanzasService.realizarCobroGastoConRecupero(idTransaccion, idArbitro, montoCobrado);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Error al realizar el cobro del gasto", e);
            return ResponseEntity.internalServerError().body("Error al realizar el cobro del gasto con");
        }
    }
}
