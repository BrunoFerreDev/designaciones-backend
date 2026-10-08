package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.EstadoCuentaArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasArbitroDetalleDTO;
import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface ArbitroMeService {
    Page<GetDesignacionDTO> getMisDesignaciones(String whatsapp, int page, int size);
    ArbitroDisponibilidadDTO getMiDisponibilidad(String whatsapp);
    GetArbitroDTO updateMiDisponibilidad(String whatsapp, ArbitroDisponibilidadDTO dto);
    Page<GetSuspencionDTO> getMisSuspenciones(String whatsapp, int page, int size);
    EstadoCuentaArbitroDTO getMiEstadoCuenta(String whatsapp);
    GetEstadisticasArbitroDetalleDTO getMisEstadisticas(String whatsapp, LocalDate inicio, LocalDate fin, String orden, int page, int size);
}
