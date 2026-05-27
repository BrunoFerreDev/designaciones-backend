package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class GastosController {
    private final FinanzasService finanzasService;

    @PostMapping(value = "/gastos", name = "Registrar Nuevo Gasto")
    public ResponseEntity<GetGastoDTO> registrarGasto(@RequestBody GastoDTO gasto) {
        System.out.println(gasto.getFecha());
        return ResponseEntity.ok(finanzasService.registrarGasto(gasto));
    }

    @PutMapping(value = "/gastos/{idGasto}/actualizar", name = "Actualizar gasto")
    public ResponseEntity<GetGastoDTO> actualizarGasto(@PathVariable Long idGasto, @RequestBody GastoDTO gastoDTO) {
        return ResponseEntity.ok(finanzasService.actualizarGasto(idGasto, gastoDTO));
    }

    @PostMapping(value = "/gastos/asociar-gasto-arbitro", name = "Asociar gasto a arbitro")
    public ResponseEntity<String> asociarGastoArbitro(@RequestParam Long idGasto, @RequestParam Long idArbitro, @RequestParam BigDecimal montoAsignado) {

        return ResponseEntity.ok(finanzasService.asociarGastoArbitro(idGasto, idArbitro, montoAsignado));
    }

}
