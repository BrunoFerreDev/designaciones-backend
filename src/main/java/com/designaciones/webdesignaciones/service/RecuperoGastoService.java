package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDetalleTransaccionGastoDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface RecuperoGastoService {
    String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado);

    String asignarArbitrosAGasto(Long idGasto, BigDecimal montoAasignar);

    Page<GetDetalleTransaccionGastoDTO> traerTransaccionesGastoConRecupero(int page, int size);

    List<GetDetalleTransaccionGastoDTO> traerTodasTransaccionesGastoConRecupero();

    GetDetalleTransaccionGastoDTO traerDetalleTransaccionGastoPorId(Long idTransaccion);

    String realizarCobroGastoConRecupero(Long idTransaccion, Long idArbitro, BigDecimal montoCobrado);
}
