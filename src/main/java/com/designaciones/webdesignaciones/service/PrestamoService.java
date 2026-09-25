package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDetallePrestamoDTO;
import com.designaciones.webdesignaciones.dto.get.GetPrestamoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface PrestamoService {
    GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado, LocalDate fechaSolicitud);

    GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado, LocalDate fecha);

    GetPrestamoDTO traerPorId(Long idPrestamo);

    Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size);

    Page<GetPrestamoDTO> traerPrestamos(Pageable pageable, String estado);

    GetPrestamoDTO actualizarFechaPrestamo(Long idPrestamo, LocalDate nuevaFecha);

    GetPrestamoDTO actualizarFechaPagoPrestamo(Long idPrestamo, LocalDate nuevaFecha);

    Page<GetDetallePrestamoDTO> traerDetallePrestamo(Long idPrestamo, int page, int size);

    byte[] generarReportePrestamos() throws Exception;
}
