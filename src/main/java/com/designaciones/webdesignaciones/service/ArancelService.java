package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetArancelDTO;
import com.designaciones.webdesignaciones.record.ArancelDTO;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface ArancelService {
    Page<GetArancelDTO> traerAranceles(int page, int size);

    GetArancelDTO crearNuevo(ArancelDTO arancel);

    GetArancelDTO actualizarArancel(Long idArancel, ArancelDTO arancel);

    BigDecimal calcularMontoPorArbitro(Long idCancha, Integer cantidadPartidos);

    List<GetArancelDTO> traerArancelesPorCancha(Long idCancha);
}
