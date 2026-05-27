package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;

public interface FinanzasService {
    GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado, LocalDate fechaSolicitud);

    GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado, LocalDate fecha);

    GetPrestamoDTO traerPorId(Long idPrestamo);

    String crearConcepto(ConceptoGastoDTO nuevoConcepto);

    GetGastoDTO registrarGasto(GastoDTO gasto);

    Page<GetConceptosDTO> traerConceptos(int page, int size);

    Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size);

    GetCajaDTO traerCajaActual();

    Page<GetTransaccionesDTO> traerTransacciones(int page, int size);

    Page<GetPrestamoDTO> traerPrestamos(int page, int size);

    GetGastoDTO actualizarGasto(Long idGasto, GastoDTO gastoDTO);

    GetPrestamoDTO actualizarFechaPrestamo(Long idPrestamo, LocalDate nuevaFecha);

    byte[] generarReportePrestamos() throws Exception;

    String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado);
}
