package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDisponibilidadFinDeSemanaDTO;
import com.designaciones.webdesignaciones.dto.get.GetReunionDetalleDTO;
import com.designaciones.webdesignaciones.dto.get.GetReunionResumenDTO;
import com.designaciones.webdesignaciones.dto.post.CrearReunionDTO;
import com.designaciones.webdesignaciones.dto.post.RegistrarAsistenciaBatchDTO;
import com.designaciones.webdesignaciones.dto.post.TemaReunionDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface ReunionService {
    GetReunionDetalleDTO crearReunion(CrearReunionDTO dto);
    Page<GetReunionResumenDTO> obtenerReuniones(int page, int size);
    GetReunionDetalleDTO obtenerDetalleReunion(Long idReunion);
    GetReunionDetalleDTO actualizarReunion(Long idReunion, CrearReunionDTO dto);
    void eliminarReunion(Long idReunion);
    GetReunionDetalleDTO actualizarTemas(Long idReunion, List<TemaReunionDTO> temas);
    GetReunionDetalleDTO registrarAsistenciasBatch(Long idReunion, RegistrarAsistenciaBatchDTO dto);
    GetDisponibilidadFinDeSemanaDTO obtenerDisponibilidadFinDeSemana(Long idReunion);

    List<GetReunionResumenDTO> buscarReuniones(LocalDate fechaInicio, LocalDate fechaFin, int page, int size);
}
