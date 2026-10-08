package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.ReporteDto;
import com.designaciones.webdesignaciones.service.GastoService;
import com.designaciones.webdesignaciones.service.RecuperoGastoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class GastosController {

    private final GastoService gastoService;
    private final RecuperoGastoService recuperoGastoService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/gastos", name = "Registrar Nuevo Gasto")
    public ResponseEntity<GetGastoDTO> registrarGasto(@RequestBody GastoDTO gasto) {
        log.debug("Fecha del gasto recibida: {}", gasto.getFecha());
        return ResponseEntity.ok(gastoService.registrarGasto(gasto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PutMapping(value = "/gastos/{idGasto}", name = "Actualizar gasto")
    public ResponseEntity<GetGastoDTO> actualizarGasto(@PathVariable Long idGasto, @RequestBody GastoDTO gastoDTO) {
        return ResponseEntity.ok(gastoService.actualizarGasto(idGasto, gastoDTO));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/gastos/asociar-gasto-arbitro", name = "Asociar gasto a arbitro")
    public ResponseEntity<String> asociarGastoArbitro(@RequestParam Long idGasto, @RequestParam Long idArbitro, @RequestParam BigDecimal montoAsignado) {
        return ResponseEntity.ok(recuperoGastoService.asociarGastoArbitro(idGasto, idArbitro, montoAsignado));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/gastos/asignar-arbitros", name = "Asignar ultimos designados a gasto")
    public ResponseEntity<String> asignarArbitrosAGasto(@RequestParam Long idGasto, @RequestParam BigDecimal montoAasignar) {
        return ResponseEntity.ok(recuperoGastoService.asignarArbitrosAGasto(idGasto, montoAasignar));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/gastos/{idGasto}/reporte", name = "Obtener reporte de gasto")
    public ResponseEntity<byte[]> obtenerReporteGasto(@PathVariable Long idGasto) throws Exception {
        ReporteDto reporte = gastoService.generarReporteGasto(idGasto);
        String nombreArchivo = reporte.getNombreConcepto() + reporte.getFecha() + ".pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("inline")
                .filename(nombreArchivo)
                .build());
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(reporte.getPdfBytes(), headers, HttpStatus.OK);
    }
}
