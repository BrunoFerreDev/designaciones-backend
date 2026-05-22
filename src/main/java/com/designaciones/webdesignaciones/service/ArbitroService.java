package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.GetArbitroDTO;
import org.springframework.data.domain.Page;

public interface ArbitroService {
    Page<GetArbitroDTO> getAllArbitros(int page, int size);

    GetArbitroDTO updateArbitroDisponibilidad(Long idArbitro);

    Page<GetArbitroDTO> traerDisponibles(int page, int size);

    GetArbitroDTO createArbitro(ArbitroDTO arbitroDTO);

    GetArbitroDTO updateArbitro(Long idArbitro, ArbitroDTO arbitroDTO);

    String deleteArbitro(Long idArbitro);

    String modificarDisponibilidadTotal();
}
