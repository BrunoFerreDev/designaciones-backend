package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.net.URI;

public interface FinanzasService {
    GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado);

    GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado);

    GetPrestamoDTO traerPorId(Long idPrestamo);

    String crearConcepto(ConceptoGastoDTO nuevoConcepto);

    GetGastoDTO registrarGasto(GastoDTO gasto);

    Page<GetConceptosDTO> traerConceptos(int page, int size);

    Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size);

    GetCajaDTO traerCajaActual();

    Page<GetTransaccionesDTO> traerTransacciones(int page, int size);

    Page<GetPrestamoDTO> traerPrestamos(int page, int size);
}
