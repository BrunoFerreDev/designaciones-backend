package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.ReporteDto;
import com.designaciones.webdesignaciones.service.FinanzasService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class GastosController {
    private final FinanzasService finanzasService;

    @PostMapping(value = "/gastos", name = "Registrar Nuevo Gasto")
    public ResponseEntity<GetGastoDTO> registrarGasto(@RequestBody GastoDTO gasto) {
        log.debug("Fecha del gasto recibida: {}", gasto.getFecha());
        return ResponseEntity.ok(finanzasService.registrarGasto(gasto));
    }

    @PutMapping(value = "/gastos/{idGasto}", name = "Actualizar gasto")
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
            ReporteDto reporte = finanzasService.generarReporteGasto(idGasto);
            String nombreArchivo = reporte.getNombreConcepto() + reporte.getFecha() + ".pdf";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            headers.setContentDisposition(ContentDisposition.builder("inline")
                    .filename(nombreArchivo)
                    .build());

            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(reporte.getPdfBytes(), headers, HttpStatus.OK);

        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al obtener reporte de gasto", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
