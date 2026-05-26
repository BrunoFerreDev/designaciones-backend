package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;

import java.util.List;

public interface DesignadosService {
    List<GetDesignadosDTO> obtenerTodosDesignados(Long idDesignacion);

    void eliminarDesignado(Long idDesignacion, Long idDesignado);
}
