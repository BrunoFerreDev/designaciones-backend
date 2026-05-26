package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.SuspencionDTO;
import org.springframework.data.domain.Page;

public interface SuspencionService {
    Page<GetSuspencionDTO> traerSuspenciones(Long idArbitro, int page, int size);

    GetSuspencionDTO cargarSuspencion(SuspencionDTO suspencionDTO);

    Page<GetSuspencionDTO> getAllSuspenciones(int page, int size);

    String deleteSuspencion(Long idSuspencion);
}
