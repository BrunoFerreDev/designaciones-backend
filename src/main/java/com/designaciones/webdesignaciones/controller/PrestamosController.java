package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDetallePrestamoDTO;
import com.designaciones.webdesignaciones.dto.get.GetPrestamoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import com.designaciones.webdesignaciones.service.PrestamoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping(value = "/finanzas")
@RequiredArgsConstructor
public class PrestamosController {

    private final PrestamoService prestamoService;

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/prestamos", name = "Registrar Prestamo")
    public ResponseEntity<GetPrestamoDTO> registrarPrestamo(@RequestBody PrestamoDTO prestamoDTO) {
        return ResponseEntity.ok(prestamoService.registrarPrestamo(prestamoDTO.getArbitro(), prestamoDTO.getMontoSolicitado(), prestamoDTO.getFechaSolicitud()));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/prestamos", name = "Traer Prestamos")
    public ResponseEntity<Page<GetPrestamoDTO>> traerPrestamos(@ParameterObject @PageableDefault(size = 10) Pageable pageable, @RequestParam String estado) {
        return ResponseEntity.ok(prestamoService.traerPrestamos(pageable, estado));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/prestamos/{idPrestamo}", name = "Traer un prestamo")
    public ResponseEntity<GetPrestamoDTO> traer(@PathVariable Long idPrestamo) {
        return ResponseEntity.ok(prestamoService.traerPorId(idPrestamo));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PostMapping(value = "/prestamos/{prestamoId}/pago", name = "Registrar Pago de Prestamo")
    public ResponseEntity<GetPrestamoDTO> registrarPagoPrestamo(
            @PathVariable Long prestamoId,
            @RequestParam BigDecimal montoPagado,
            @RequestParam LocalDate fecha) {
        return ResponseEntity.ok(prestamoService.registrarPagoPrestamo(prestamoId, montoPagado, fecha));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PutMapping(value = "/prestamos/{idPrestamo}/actualizar-fecha-pago", name = "Actualizar fecha de pago de prestamo")
    public ResponseEntity<GetPrestamoDTO> actualizarFechaPagoPrestamo(
            @PathVariable Long idPrestamo,
            @RequestParam LocalDate nuevaFecha) {
        return ResponseEntity.ok(prestamoService.actualizarFechaPagoPrestamo(idPrestamo, nuevaFecha));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE')")
    @PutMapping(value = "/prestamos/{idPrestamo}/actualizar-fecha", name = "Actualizar fecha de prestamo")
    public ResponseEntity<GetPrestamoDTO> actualizarFechaPrestamo(
            @PathVariable Long idPrestamo,
            @RequestParam LocalDate nuevaFecha) {
        return ResponseEntity.ok(prestamoService.actualizarFechaPrestamo(idPrestamo, nuevaFecha));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/prestamos/reporte", name = "Generar reporte de prestamos")
    public ResponseEntity<byte[]> generarReportePrestamos() throws Exception {
        byte[] pdfBytes = prestamoService.generarReportePrestamos();
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"reporte_prestamos.pdf\"")
                .body(pdfBytes);
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO') or (hasRole('ARBITRO') and @securityService.esMismoArbitro(authentication, #idArbitro))")
    @GetMapping(value = "/prestamos/arbitro/{idArbitro}", name = "Traer Prestamos por Arbitro")
    public ResponseEntity<Page<GetPrestamoDTO>> traerPrestamosPorArbitro(
            @PathVariable Long idArbitro,
            @RequestParam int page,
            @RequestParam int size,
            Authentication authentication) {
        return ResponseEntity.ok(prestamoService.traerPrestamosPorArbitro(idArbitro, page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @GetMapping(value = "/prestamos/{idPrestamo}/detalle", name = "Traer detalle de un prestamo")
    public ResponseEntity<Page<GetDetallePrestamoDTO>> traerDetallePrestamo(
            @PathVariable Long idPrestamo,
            @RequestParam int page,
            @RequestParam int size) {
        return ResponseEntity.ok(prestamoService.traerDetallePrestamo(idPrestamo, page, size));
    }
}
