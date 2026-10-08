package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetTransaccionesDTO;
import org.springframework.data.domain.Page;

public interface TransaccionService {
    Page<GetTransaccionesDTO> traerTransacciones(int page, int size);

    GetTransaccionesDTO traerTransaccionPorId(Long idTransaccion);
}
