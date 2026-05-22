package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.CanchaDTO;
import com.designaciones.webdesignaciones.dto.GetCanchaDTO;
import org.springframework.data.domain.Page;

public interface CanchaService {
    Page<GetCanchaDTO> getAllCanchas(int page, int size);

    Page<GetCanchaDTO> getActiveCanchas(int page, int size);

    void toggleCanchaEstado(Long idCancha);

    GetCanchaDTO createCancha(CanchaDTO canchaDTO);
}
