package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface DesignacionService {
    GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO);

    GetDesignacionDTO asignarArbitroADesignacion( Long idDesignacion, Long idArbitro);

    // Asignación automática de árbitros para una designación usando árbitros activos
    GetDesignacionDTO asignarArbitrosAutomaticamente(Long idDesignacion);

    List<GetDesignacionDTO> obtenerPorEstado(int estado);

    List<GetDesignadosDTO> obtenerArbitrosDesignados(Long idDesignacion);

    GetDesignacionDTO quitarArbitroDeDesignacion(Long idDesignacion, Long idArbitro);

    void eliminarDesignacion(Long idDesignacion);

    GetDesignacionDTO finalizarDesignacion(Long idDesignacion);

    List<GetDesignacionDTO> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin);

    List<GetDesignacionDTO> obtenerPorFecha(LocalDate fecha);

    GetDesignacionDTO actualizarDesignacion(Long idDesignacion, DesignacionDTO designacionDTO);

    GetDesignacionDTO designarListaArbitrosADesignacion(Long idDesignacion, List<Long> idsArbitros);

    GetDesignacionDTO cambiarEstadoDesignacion(Long idDesignacion);

    GetDesignacionDTO aceptarDesignacion(Long idDesignacion);

    GetDesignacionDTO reprogramarDesignacion(Long idDesignacion);

    List<GetDesignacionDTO> obtenerPorMes(int mes, int anio);
}
