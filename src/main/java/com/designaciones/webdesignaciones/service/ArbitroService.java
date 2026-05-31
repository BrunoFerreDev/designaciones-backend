package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import org.springframework.data.domain.Page;

public interface ArbitroService {
    Page<GetArbitroDTO> getAllArbitros(int page, int size);

    GetArbitroDTO updateArbitroDisponibilidad(Long idArbitro, ArbitroDisponibilidadDTO dto);

    Page<GetArbitroDTO> traerDisponibles(int page, int size);

    GetArbitroDTO createArbitro(ArbitroDTO arbitroDTO);

    GetArbitroDTO updateArbitro(Long idArbitro, ArbitroDTO arbitroDTO);

    String deleteArbitro(Long idArbitro);

    String modificarDisponibilidadTotal();

    Page<GetArbitroDTO> traerTodos(int page, int size);
}
