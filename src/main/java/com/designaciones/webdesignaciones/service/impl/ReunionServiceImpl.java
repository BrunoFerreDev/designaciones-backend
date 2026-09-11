package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.*;
import com.designaciones.webdesignaciones.enums.EstadoAsistencia;
import com.designaciones.webdesignaciones.event.ArbitroDisponibleEvent;
import com.designaciones.webdesignaciones.event.ArbitroNoDisponibleEvent;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.AsistenciaReunion;
import com.designaciones.webdesignaciones.model.Reunion;
import com.designaciones.webdesignaciones.model.TemaReunion;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.AsistenciaReunionRepository;
import com.designaciones.webdesignaciones.repository.ReunionRepository;
import com.designaciones.webdesignaciones.repository.TemaReunionRepository;
import com.designaciones.webdesignaciones.service.ReunionService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReunionServiceImpl implements ReunionService {

    private final ReunionRepository reunionRepository;
    private final TemaReunionRepository temaReunionRepository;
    private final AsistenciaReunionRepository asistenciaReunionRepository;
    private final ArbitroRepository arbitroRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public GetReunionDetalleDTO crearReunion(CrearReunionDTO dto) {
        Reunion reunion = Reunion.builder().fecha(dto.getFecha()).lugar(dto.getLugar()).titulo(dto.getTitulo()).observaciones(dto.getObservaciones()).editable(true).build();

        Reunion guardada = reunionRepository.save(reunion);

        // Guardar temas iniciales si los hay
        if (dto.getTemas() != null && !dto.getTemas().isEmpty()) {
            int ordenIdx = 1;
            for (TemaReunionDTO tDto : dto.getTemas()) {
                TemaReunion tema = TemaReunion.builder().reunion(guardada).titulo(tDto.getTitulo()).descripcion(tDto.getDescripcion()).orden(tDto.getOrden() != null ? tDto.getOrden() : ordenIdx++).urlMaterial(tDto.getUrlMaterial()).build();
                temaReunionRepository.save(tema);
            }
        }

        // Precargar asistencia con árbitros activos
        if (Boolean.TRUE.equals(dto.getInicializarAsistencia())) {
            List<Arbitro> arbitrosActivos = arbitroRepository.findAll().stream().filter(a -> Boolean.TRUE.equals(a.getEstadoSistema())).toList();

            List<AsistenciaReunion> asistenciasIniciales = new ArrayList<>();
            for (Arbitro arbitro : arbitrosActivos) {
                asistenciasIniciales.add(AsistenciaReunion.builder().reunion(guardada).arbitro(arbitro).estadoAsistencia(EstadoAsistencia.AUSENTE).disponibleSabado(false).disponibleDomingo(false).build());
            }
            asistenciaReunionRepository.saveAll(asistenciasIniciales);
        }

        return obtenerDetalleReunion(guardada.getIdReunion());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetReunionResumenDTO> obtenerReuniones(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Reunion> reuniones = reunionRepository.findAllByOrderByFechaDesc(pageable);

        return reuniones.map(r -> {
            long id = r.getIdReunion();
            int cantidadTemas = temaReunionRepository.findByReunion_IdReunionOrderByOrdenAsc(id).size();
            long presentes = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.PRESENTE);
            long ausentes = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.AUSENTE);
            long justificados = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.JUSTIFICADO);
            long dispSabado = asistenciaReunionRepository.countByReunion_IdReunionAndDisponibleSabadoTrue(id);
            long dispDomingo = asistenciaReunionRepository.countByReunion_IdReunionAndDisponibleDomingoTrue(id);

            return GetReunionResumenDTO.builder().idReunion(r.getIdReunion()).fecha(r.getFecha()).lugar(r.getLugar()).titulo(r.getTitulo()).cantidadTemas(cantidadTemas).totalPresentes(presentes).totalAusentes(ausentes).totalJustificados(justificados).disponiblesSabado(dispSabado).disponiblesDomingo(dispDomingo).editable(r.getEditable()).build();
        });
    }

    @Override
    @Transactional(readOnly = true)
    public GetReunionDetalleDTO obtenerDetalleReunion(Long idReunion) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        List<TemaReunion> temas = temaReunionRepository.findByReunion_IdReunionOrderByOrdenAsc(idReunion);
        List<AsistenciaReunion> asistencias = asistenciaReunionRepository.findByReunion_IdReunion(idReunion);

        List<TemaReunionDTO> temasDTO = temas.stream().map(TemaReunionDTO::new).toList();
        List<GetAsistenciaDTO> asistenciasDTO = asistencias.stream().map(GetAsistenciaDTO::new).toList();

        long presentes = asistencias.stream().filter(a -> a.getEstadoAsistencia() == EstadoAsistencia.PRESENTE).count();
        long ausentes = asistencias.stream().filter(a -> a.getEstadoAsistencia() == EstadoAsistencia.AUSENTE).count();
        long justificados = asistencias.stream().filter(a -> a.getEstadoAsistencia() == EstadoAsistencia.JUSTIFICADO).count();
        long dispSab = asistencias.stream().filter(a -> Boolean.TRUE.equals(a.getDisponibleSabado())).count();
        long dispDom = asistencias.stream().filter(a -> Boolean.TRUE.equals(a.getDisponibleDomingo())).count();

        return GetReunionDetalleDTO.builder().idReunion(reunion.getIdReunion()).fecha(reunion.getFecha()).lugar(reunion.getLugar()).titulo(reunion.getTitulo()).observaciones(reunion.getObservaciones()).editable(reunion.getEditable()).totalPresentes(presentes).totalAusentes(ausentes).totalJustificados(justificados).disponiblesSabado(dispSab).disponiblesDomingo(dispDom).temas(temasDTO).asistencias(asistenciasDTO).build();
    }

    @Override
    @Transactional
    public GetReunionDetalleDTO actualizarReunion(Long idReunion, CrearReunionDTO dto) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        if (dto.getFecha() != null) reunion.setFecha(dto.getFecha());
        if (dto.getLugar() != null) reunion.setLugar(dto.getLugar());
        if (dto.getTitulo() != null) reunion.setTitulo(dto.getTitulo());
        if (dto.getObservaciones() != null) reunion.setObservaciones(dto.getObservaciones());

        reunionRepository.save(reunion);
        return obtenerDetalleReunion(idReunion);
    }

    @Override
    @Transactional
    public void eliminarReunion(Long idReunion) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        asistenciaReunionRepository.deleteByReunion_IdReunion(idReunion);
        temaReunionRepository.deleteByReunion_IdReunion(idReunion);
        reunionRepository.delete(reunion);
    }

    @Override
    @Transactional
    public GetReunionDetalleDTO actualizarTemas(Long idReunion, List<TemaReunionDTO> temas) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        temaReunionRepository.deleteByReunion_IdReunion(idReunion);

        if (temas != null && !temas.isEmpty()) {
            int orden = 1;
            List<TemaReunion> nuevosTemas = new ArrayList<>();
            for (TemaReunionDTO t : temas) {
                nuevosTemas.add(TemaReunion.builder().reunion(reunion).titulo(t.getTitulo()).descripcion(t.getDescripcion()).orden(t.getOrden() != null ? t.getOrden() : orden++).urlMaterial(t.getUrlMaterial()).build());
            }
            temaReunionRepository.saveAll(nuevosTemas);
        }

        return obtenerDetalleReunion(idReunion);
    }

    @Override
    @Transactional
    @CacheEvict(value = "arbitros", allEntries = true)
    public GetReunionDetalleDTO registrarAsistenciasBatch(Long idReunion, RegistrarAsistenciaBatchDTO dto) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        boolean sincronizar = Boolean.TRUE.equals(dto.getSincronizarDisponibilidad());

        for (ItemAsistenciaDTO item : dto.getAsistencias()) {
            if (item.getIdArbitro() == null) continue;

            Arbitro arbitro = arbitroRepository.findById(item.getIdArbitro()).orElseThrow(() -> new NotFoundException("Árbitro no encontrado con id: " + item.getIdArbitro()));

            Optional<AsistenciaReunion> optAsistencia = asistenciaReunionRepository.findByReunion_IdReunionAndArbitro_IdArbitro(idReunion, arbitro.getIdArbitro());

            AsistenciaReunion asistencia = optAsistencia.orElseGet(() -> AsistenciaReunion.builder().reunion(reunion).arbitro(arbitro).build());

            if (item.getEstadoAsistencia() != null) {
                asistencia.setEstadoAsistencia(item.getEstadoAsistencia());
            }
            if (item.getObservacion() != null) {
                asistencia.setObservacion(item.getObservacion());
            }
            if (item.getDisponibleSabado() != null) {
                asistencia.setDisponibleSabado(item.getDisponibleSabado());
            }
            if (item.getDisponibleDomingo() != null) {
                asistencia.setDisponibleDomingo(item.getDisponibleDomingo());
            }

            asistenciaReunionRepository.save(asistencia);

            // Sincronizar disponibilidad activa del árbitro si fue solicitado
            if (sincronizar) {
                boolean prevSabado = Boolean.TRUE.equals(arbitro.getDisponibleSabado());
                boolean prevDomingo = Boolean.TRUE.equals(arbitro.getDisponibleDomingo());

                boolean nuevoSabado = Boolean.TRUE.equals(asistencia.getDisponibleSabado());
                boolean nuevoDomingo = Boolean.TRUE.equals(asistencia.getDisponibleDomingo());

                arbitro.setDisponibleSabado(nuevoSabado);
                arbitro.setDisponibleDomingo(nuevoDomingo);
                arbitroRepository.save(arbitro);

                boolean sabadoChangedToNoDisp = prevSabado && !nuevoSabado;
                boolean domingoChangedToNoDisp = prevDomingo && !nuevoDomingo;

                if (sabadoChangedToNoDisp || domingoChangedToNoDisp) {
                    eventPublisher.publishEvent(new ArbitroNoDisponibleEvent(this, arbitro.getIdArbitro(), sabadoChangedToNoDisp, domingoChangedToNoDisp));
                }

                if (nuevoSabado || nuevoDomingo) {
                    eventPublisher.publishEvent(new ArbitroDisponibleEvent(this, arbitro.getIdArbitro(), nuevoSabado, nuevoDomingo));
                }
            }
        }

        return obtenerDetalleReunion(idReunion);
    }

    @Override
    @Transactional(readOnly = true)
    public GetDisponibilidadFinDeSemanaDTO obtenerDisponibilidadFinDeSemana(Long idReunion) {
        Reunion reunion = reunionRepository.findById(idReunion).orElseThrow(() -> new NotFoundException("Reunión no encontrada con id: " + idReunion));

        List<AsistenciaReunion> asistencias = asistenciaReunionRepository.findByReunion_IdReunion(idReunion);

        List<GetAsistenciaDTO> dtos = asistencias.stream().map(GetAsistenciaDTO::new).toList();

        List<GetAsistenciaDTO> dispSabado = dtos.stream().filter(a -> Boolean.TRUE.equals(a.getDisponibleSabado())).toList();

        List<GetAsistenciaDTO> dispDomingo = dtos.stream().filter(a -> Boolean.TRUE.equals(a.getDisponibleDomingo())).toList();

        List<GetAsistenciaDTO> dispAmbos = dtos.stream().filter(a -> Boolean.TRUE.equals(a.getDisponibleSabado()) && Boolean.TRUE.equals(a.getDisponibleDomingo())).toList();

        List<GetAsistenciaDTO> noDisp = dtos.stream().filter(a -> !Boolean.TRUE.equals(a.getDisponibleSabado()) && !Boolean.TRUE.equals(a.getDisponibleDomingo())).toList();

        return GetDisponibilidadFinDeSemanaDTO.builder().idReunion(reunion.getIdReunion()).fechaReunion(reunion.getFecha()).tituloReunion(reunion.getTitulo()).totalEvaluados(dtos.size()).totalDisponiblesSabado(dispSabado.size()).totalDisponiblesDomingo(dispDomingo.size()).totalDisponiblesAmbosDias(dispAmbos.size()).totalNoDisponibles(noDisp.size()).disponiblesSabado(dispSabado).disponiblesDomingo(dispDomingo).disponiblesAmbosDias(dispAmbos).noDisponibles(noDisp).build();
    }

    @Override
    public List<GetReunionResumenDTO> buscarReuniones(LocalDate fechaInicio, LocalDate fechaFin, int page, int size) {

        Page<Reunion> reunions = reunionRepository.findByFechaBetweenOrderByFechaDesc(fechaInicio != null ? fechaInicio.atStartOfDay() : LocalDateTime.MIN, fechaFin != null ? fechaFin.atStartOfDay() : LocalDateTime.MAX, PageRequest.of(page, size));

        return reunions.stream().map(r -> {
            long id = r.getIdReunion();
            int cantidadTemas = temaReunionRepository.findByReunion_IdReunionOrderByOrdenAsc(id).size();
            long presentes = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.PRESENTE);
            long ausentes = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.AUSENTE);
            long justificados = asistenciaReunionRepository.countByReunion_IdReunionAndEstadoAsistencia(id, EstadoAsistencia.JUSTIFICADO);
            long dispSabado = asistenciaReunionRepository.countByReunion_IdReunionAndDisponibleSabadoTrue(id);
            long dispDomingo = asistenciaReunionRepository.countByReunion_IdReunionAndDisponibleDomingoTrue(id);

            return GetReunionResumenDTO.builder().idReunion(r.getIdReunion()).fecha(r.getFecha()).lugar(r.getLugar()).titulo(r.getTitulo()).cantidadTemas(cantidadTemas).totalPresentes(presentes).totalAusentes(ausentes).totalJustificados(justificados).disponiblesSabado(dispSabado).disponiblesDomingo(dispDomingo).editable(r.getEditable()).build();
        }).toList();
    }
}
