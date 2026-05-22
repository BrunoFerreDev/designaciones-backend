package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.DesignacionDTO;
import com.designaciones.webdesignaciones.dto.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.GetDesignadosDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface DesignacionService {
    GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO);

    GetDesignacionDTO asignarArbitroADesignacion(Long idDesignacion, Long idArbitro);

    // Asignación automática de árbitros para una designación usando árbitros activos
    GetDesignacionDTO asignarArbitrosAutomaticamente(Long idDesignacion);

    List<GetDesignacionDTO> obtenerPorEstado(int estado);

    List<GetDesignadosDTO> obtenerArbitrosDesignados(Long idDesignacion);

    GetDesignacionDTO quitarArbitroDeDesignacion(Long idDesignacion, Long idArbitro);

    void eliminarDesignacion(Long idDesignacion);

    GetDesignacionDTO finalizarDesignacion(Long idDesignacion);

    List<GetDesignacionDTO> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin);

    List<GetDesignacionDTO> obtenerPorFecha(LocalDate fecha);
}
