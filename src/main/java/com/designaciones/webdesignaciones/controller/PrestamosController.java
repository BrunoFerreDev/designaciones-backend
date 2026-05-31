package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDetallePrestamoDTO;
import com.designaciones.webdesignaciones.dto.get.GetPrestamoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import com.designaciones.webdesignaciones.service.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class PrestamosController {
    private final FinanzasService finanzasService;

    @PostMapping(value = "/prestamos", name = "Registrar Prestamo")
    public ResponseEntity<GetPrestamoDTO> registrarPrestamo(@RequestBody PrestamoDTO prestamoDTO) {
        return ResponseEntity.ok(finanzasService.registrarPrestamo(prestamoDTO.getArbitro(), prestamoDTO.getMontoSolicitado(), prestamoDTO.getFechaSolicitud()));
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
    public ResponseEntity<GetPrestamoDTO> registrarPagoPrestamo(@PathVariable Long prestamoId, @RequestParam BigDecimal montoPagado, @RequestParam LocalDate fecha) {
        return ResponseEntity.ok(finanzasService.registrarPagoPrestamo(prestamoId, montoPagado, fecha));
    }

    @PutMapping(value = "/prestamos/{idPrestamo}/actualizar-fecha-pago", name = "Actualizar fecha de pago de prestamo")
    public ResponseEntity<GetPrestamoDTO> actualizarFechaPagoPrestamo(@PathVariable Long idPrestamo, @RequestParam LocalDate nuevaFecha) {
        return ResponseEntity.ok(finanzasService.actualizarFechaPagoPrestamo(idPrestamo, nuevaFecha));
    }

    @PutMapping(value = "/prestamos/{idPrestamo}/actualizar-fecha", name = "Actualizar fecha de prestamo")
    public ResponseEntity<GetPrestamoDTO> actualizarFechaPrestamo(@PathVariable Long idPrestamo, @RequestParam LocalDate nuevaFecha) {

        return ResponseEntity.ok(finanzasService.actualizarFechaPrestamo(idPrestamo, nuevaFecha));
    }

    @GetMapping(value = "/prestamos/reporte", name = "Generar reporte de prestamos")
    public ResponseEntity<byte[]> generarReportePrestamos() {
        try {
            byte[] pdfBytes = finanzasService.generarReportePrestamos();
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"reporte_prestamos.pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Error al generar reporte de prestamos", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/prestamos/arbitro/{idArbitro}", name = "Traer Prestamos por Arbitro")
    public ResponseEntity<Page<GetPrestamoDTO>> traerPrestamosPorArbitro(@PathVariable Long idArbitro, @RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerPrestamosPorArbitro(idArbitro, page, size));
    }

    @GetMapping(value = "/prestamos/{idPrestamo}/detalle", name = "Traer detalle de un prestamo")
    public ResponseEntity<Page<GetDetallePrestamoDTO>> traerDetallePrestamo(@PathVariable Long idPrestamo, @RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(finanzasService.traerDetallePrestamo(idPrestamo, page, size));
    }
}
