package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetComparacionEstadisticasArbitrosDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasArbitroDetalleDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasDesignacionesDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface DesignacionEstadisticasService {

    GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin);

    GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin, String orden);

    GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin);

    GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden);

    GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden, int page, int size);

    GetComparacionEstadisticasArbitrosDTO obtenerEstadisticasComparativas(List<Long> idsArbitros, int mesInicio, int mesFin);
}
