package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.GetDesignadosDTO;

import java.util.List;

public interface DesignadosService {
    List<GetDesignadosDTO> obtenerTodosDesignados(Long idDesignacion);

    void eliminarDesignado(Long idDesignacion, Long idDesignado);
}
