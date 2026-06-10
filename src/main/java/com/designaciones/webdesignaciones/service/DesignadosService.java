package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;

import java.math.BigDecimal;
import java.util.List;

public interface DesignadosService {
    List<GetDesignadosDTO> obtenerTodosDesignados(Long idDesignacion);

    void eliminarDesignado(Long idDesignacion, Long idDesignado);


    String actualizarMonto(Long idDesignado, BigDecimal nuevoMonto);

    String actualizarMontoCompleto(Long idDesignacion, BigDecimal montoPorArbitro);
}
