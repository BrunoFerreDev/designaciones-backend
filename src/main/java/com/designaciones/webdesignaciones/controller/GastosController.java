package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    @PostMapping(value = "/gastos/asignar-arbitros", name = "Asignar ultimos designados a gasto")
    public ResponseEntity<String> asignarArbitrosAGasto(@RequestParam Long idGasto, @RequestParam BigDecimal montoAasignar) {
        return ResponseEntity.ok(finanzasService.asignarArbitrosAGasto(idGasto, montoAasignar));
    }

    @GetMapping(value = "/gastos/{idGasto}/reporte", name = "Obtener reporte de gasto")
    public ResponseEntity<byte[]> obtenerReporteGasto(@PathVariable Long idGasto) {
        try {
            byte[] pdfBytes = finanzasService.generarReporteGasto(idGasto);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            headers.setContentDispositionFormData("inline", "ReporteGasto_" + idGasto + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
