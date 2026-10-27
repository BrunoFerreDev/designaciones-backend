package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.component.DesignacionRuleEngine;
import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.DesignacionEstadisticasService;
import com.designaciones.webdesignaciones.service.DesignacionService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignacionServiceImpl implements DesignacionService {

    private final DesignacionRepository designacionRepository;
    private final CanchaRepository canchaRepository;
    private final ArbitroRepository arbitroRepository;
    private final DesignadosRepository designadosRepository;
    private final ArancelRepo arancelRepo;
    private final DesignacionEstadisticasService designacionEstadisticasService;
    private final DesignacionRuleEngine designacionRuleEngine;
    private final HistorialEstadoDesignacionRepository historialEstadoDesignacionRepository;
    private final HistorialArbitroDesignacionRepository historialArbitroDesignacionRepository;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO) {
        Designacion designacion = Designacion.builder()
                .fecha(designacionDTO.getFecha())
                .cancha(buscarCancha(designacionDTO.getIdCancha()))
                .etapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato()))
                .cantidadPartidos(designacionDTO.getCantidadPartidos())
                .estadoDesignacion(0)
                .editable(true)
                .detalleExtra("Designación creada correctamente y sin detalles")
                .build();
        designacionRepository.save(designacion);
        registrarCambioEstado(designacion, null, 0, "Creación inicial de designación");
        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Cacheable(value = "designaciones", key = "'obtenerPorEstado_' + #estado + '_' + #page + '_' + #size")
    public Page<GetDesignacionDTO> obtenerPorEstado(int estado, int page, int size) {
        Page<Designacion> designaciones = designacionRepository.findByEstadoDesignacion(estado, PageRequest.of(page, size, Sort.by("fecha").descending()));
        return designaciones.map(GetDesignacionDTO::new);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public void eliminarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        historialEstadoDesignacionRepository.deleteAllByDesignacion_IdDesignacion(idDesignacion);
        historialArbitroDesignacionRepository.deleteAllByDesignacion_IdDesignacion(idDesignacion);
        designadosRepository.deleteAllByDesignacion_IdDesignacion(idDesignacion);
        designacionRepository.delete(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO finalizarDesignacion(Long idDesignacion, String detalle) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        int estadoAnterior = designacion.getEstadoDesignacion();
        designacion.setEstadoDesignacion(2);
        designacion.setEditable(false);
        if (detalle != null && !detalle.trim().isEmpty()) {
            designacion.setDetalleExtra(detalle.trim());
        } else if (designacion.getDetalleExtra() == null || designacion.getDetalleExtra().isEmpty()) {
            designacion.setDetalleExtra("Designación finalizada y sin detalle adicional");
        }
        designacionRepository.save(designacion);

        if (estadoAnterior != 2) {
            registrarCambioEstado(designacion, estadoAnterior, 2, designacion.getDetalleExtra());
        }

        List<Designados> arbitrosActivos = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Designados d : arbitrosActivos) {
            int partidos = d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0;
            boolean participo = partidos > 0 || (designacion.getCantidadPartidos() != null && designacion.getCantidadPartidos() > 0);
            d.setParticipo(participo);
            designadosRepository.save(d);

            if (d.getArbitro() != null) {
                Optional<HistorialArbitroDesignacion> opt = historialArbitroDesignacionRepository
                        .findFirstByDesignacion_IdDesignacionAndArbitro_IdArbitroAndActivoTrue(idDesignacion, d.getArbitro().getIdArbitro());
                if (opt.isPresent()) {
                    HistorialArbitroDesignacion h = opt.get();
                    h.setParticipo(participo);
                    h.setPartidosDirigidos(d.getPartidosDirigidos());
                    h.setMontoPercibido(d.getMontoPercibido());
                    h.setMotivo("Jornada finalizada");
                    historialArbitroDesignacionRepository.save(h);
                } else {
                    HistorialArbitroDesignacion h = HistorialArbitroDesignacion.builder()
                            .designacion(designacion)
                            .arbitro(d.getArbitro())
                            .fechaAsignacion(designacion.getFecha() != null ? designacion.getFecha() : LocalDateTime.now())
                            .activo(true)
                            .participo(participo)
                            .partidosDirigidos(d.getPartidosDirigidos())
                            .montoPercibido(d.getMontoPercibido())
                            .motivo("Jornada finalizada")
                            .build();
                    historialArbitroDesignacionRepository.save(h);
                }
            }
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Cacheable(value = "designaciones", key = "'buscarPorFechas_' + #inicio + '_' + #fin")
    public List<GetDesignacionDTO> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        List<Designacion> designaciones = designacionRepository.findByFechaBetween(inicio, fin);
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    @Cacheable(value = "designaciones", key = "'obtenerPorFecha_' + #fecha")
    public List<GetDesignacionDTO> obtenerPorFecha(LocalDate fecha) {
        LocalDateTime fechaParse = fecha.atStartOfDay();
        List<Designacion> designaciones = designacionRepository.findByFechaBetween(fechaParse, fecha.atTime(LocalTime.MAX));
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO actualizarDesignacion(Long idDesignacion, DesignacionDTO designacionDTO) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));

        int estadoAnterior = designacion.getEstadoDesignacion();
        boolean cambioEstado = designacionDTO.getEstadoDesignacion() != null && designacionDTO.getEstadoDesignacion() != estadoAnterior;

        if (designacionDTO.getFecha() != null) {
            designacion.setFecha(designacionDTO.getFecha());
        }
        if (designacionDTO.getIdCancha() != null) {
            designacion.setCancha(buscarCancha(designacionDTO.getIdCancha()));
        }
        if (designacionDTO.getEtapaCampeonato() != null) {
            designacion.setEtapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato()));
        }
        if (designacionDTO.getCantidadPartidos() != null) {
            designacion.setCantidadPartidos(designacionDTO.getCantidadPartidos());
        }
        if (designacionDTO.getEstadoDesignacion() != null) {
            designacion.setEstadoDesignacion(designacionDTO.getEstadoDesignacion());
        }
        if (designacionDTO.getDetalle() != null) {
            designacion.setDetalleExtra(designacionDTO.getDetalle());
        }
        if (designacionDTO.getEditable() != null) {
            designacion.setEditable(designacionDTO.getEditable());
        } else if (designacion.getEditable() == null) {
            designacion.setEditable(true);
        }

        designacionRepository.save(designacion);

        if (cambioEstado) {
            registrarCambioEstado(designacion, estadoAnterior, designacionDTO.getEstadoDesignacion(),
                    designacionDTO.getDetalle() != null ? designacionDTO.getDetalle() : "Actualización de designación");
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO designarListaArbitrosADesignacion(Long idDesignacion, List<Long> idsArbitros) {
        for (Long idArbitro : idsArbitros) {
            procesarAsignacionArbitro(idDesignacion, idArbitro, false);
        }
        return obtenerPorId(idDesignacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO cambiarEstadoDesignacion(Long idDesignacion, String detalle) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        int estadoAnterior = designacion.getEstadoDesignacion();
        designacion.setEstadoDesignacion(3);
        designacion.setDetalleExtra(detalle);
        designacion.setEditable(true);
        designacionRepository.save(designacion);
        registrarCambioEstado(designacion, estadoAnterior, 3, detalle != null ? detalle : "Jornada cancelada");

        // Snapshot de arbitros asignados que no participaron por cancelacion
        List<Designados> asignados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Designados d : asignados) {
            if (d.getArbitro() != null) {
                registrarSnapshotArbitro(designacion, d.getArbitro(), detalle != null ? detalle : "Jornada cancelada", false, 0, BigDecimal.ZERO);
            }
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO suspenderDesignacion(Long idDesignacion, String motivo) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        int estadoAnterior = designacion.getEstadoDesignacion();
        designacion.setEstadoDesignacion(5);
        String detalle = (motivo != null && !motivo.trim().isEmpty()) ? motivo.trim() : "Jornada suspendida / pendiente de reprogramación";
        designacion.setDetalleExtra(detalle);
        designacion.setEditable(true);
        designacionRepository.save(designacion);
        registrarCambioEstado(designacion, estadoAnterior, 5, detalle);

        // Snapshot de arbitros asignados al momento de la suspension
        List<Designados> asignados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Designados d : asignados) {
            if (d.getArbitro() != null) {
                int partidos = d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0;
                boolean participo = partidos > 0;
                registrarSnapshotArbitro(designacion, d.getArbitro(), detalle, participo, partidos, d.getMontoPercibido());
            }
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO aceptarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        int estadoAnterior = designacion.getEstadoDesignacion();
        designacion.setEstadoDesignacion(1);
        designacion.setDetalleExtra("Designación aceptada");
        designacion.setEditable(true);
        designacionRepository.save(designacion);
        if (estadoAnterior != 1) {
            registrarCambioEstado(designacion, estadoAnterior, 1, "Designación aceptada");
        }
        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO reprogramarDesignacion(Long idDesignacion) {
        return reprogramarDesignacion(idDesignacion, null, null);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO reprogramarDesignacion(Long idDesignacion, LocalDateTime nuevaFecha, String motivo) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));

        int estadoAnterior = designacion.getEstadoDesignacion();
        LocalDateTime fechaAnterior = designacion.getFecha();
        LocalDateTime fechaFinal = (nuevaFecha != null)
                ? nuevaFecha
                : (fechaAnterior != null ? fechaAnterior.plusDays(7) : LocalDateTime.now().plusDays(7));

        designacion.setFecha(fechaFinal);
        designacion.setEditable(true);

        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        int nuevoEstado = (designadosActuales.size() >= needed) ? 1 : 0;
        designacion.setEstadoDesignacion(nuevoEstado);

        String motivoFinal = (motivo != null && !motivo.trim().isEmpty())
                ? motivo.trim()
                : "Jornada reprogramada para fecha " + fechaFinal.toLocalDate();
        designacion.setDetalleExtra(motivoFinal);

        designacionRepository.save(designacion);

        registrarCambioEstado(designacion, estadoAnterior, nuevoEstado,
                "Reprogramación: fecha anterior " + (fechaAnterior != null ? fechaAnterior.toLocalDate() : "sin fecha") +
                        ", nueva fecha " + fechaFinal.toLocalDate() + ". Motivo: " + motivoFinal);

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Cacheable(value = "designaciones", key = "'obtenerPorMes_' + #mes + '_' + #anio")
    public List<GetDesignacionDTO> obtenerPorMes(int mes, int anio) {
        List<Designacion> designaciones = designacionRepository.findByMesAndAnio(mes, anio);
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO quitarArbitroDeDesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        List<Designados> designado = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        Designados aEliminar = designado.stream()
                .filter(d -> Objects.equals(d.getArbitro().getIdArbitro(), idArbitro))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("El árbitro no está asignado a esta designación"));

        if (designacion.getEstadoDesignacion() != 0) {
            registrarBajaArbitro(idDesignacion, aEliminar.getArbitro(), "Quitado de la designación", false);
        }
        designadosRepository.delete(aEliminar);

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        if (designadosActualizados.size() < needed && designacion.getEstadoDesignacion() == 1) {
            int estadoAnt = designacion.getEstadoDesignacion();
            designacion.setEstadoDesignacion(0);
            designacionRepository.save(designacion);
            registrarCambioEstado(designacion, estadoAnt, 0, "Cuadrilla incompleta tras quitar árbitro " + aEliminar.getArbitro().getNombreCompleto());
        }
        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO asignarArbitroADesignacion(Long idDesignacion, Long idArbitro) {
        return procesarAsignacionArbitro(idDesignacion, idArbitro, false);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO forzarAsignarArbitroADesignacion(Long idDesignacion, Long idArbitro) {
        return procesarAsignacionArbitro(idDesignacion, idArbitro, true);
    }

    private GetDesignacionDTO procesarAsignacionArbitro(Long idDesignacion, Long idArbitro, boolean forzarEtapa) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        Arbitro arbitro = buscarArbitro(idArbitro);
        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);

        designacionRuleEngine.validarAsignacion(designacion, arbitro, designadosActuales, forzarEtapa);

        Designados designados = new Designados();
        designados.setArbitro(arbitro);
        designados.setDesignacion(designacion);
        designados.setCategoriaArbitro(arbitro.getCategoria());
        designados.setPartidosDirigidos(0);
        designados.setMontoPercibido(new BigDecimal("0.0"));
        designados.setParticipo(null);
        designadosRepository.save(designados);

        if (designacion.getEstadoDesignacion() != 0) {
            registrarAsignacionArbitro(designacion, arbitro, "Asignado a la designación");
        }

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            int estadoAnt = designacion.getEstadoDesignacion();
            designacion.setEstadoDesignacion(1);
            designacionRepository.save(designacion);
            registrarCambioEstado(designacion, estadoAnt, 1, "Cuadrilla completada automáticamente");
        } else {
            designacionRepository.save(designacion);
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    public GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin) {
        return designacionEstadisticasService.obtenerEstadisticas(inicio, fin);
    }

    @Override
    public GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin, String orden) {
        return designacionEstadisticasService.obtenerEstadisticas(inicio, fin, orden);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin) {
        return designacionEstadisticasService.obtenerEstadisticasArbitro(idArbitro, inicio, fin);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden) {
        return designacionEstadisticasService.obtenerEstadisticasArbitro(idArbitro, inicio, fin, orden);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden, int page, int size) {
        return designacionEstadisticasService.obtenerEstadisticasArbitro(idArbitro, inicio, fin, orden, page, size);
    }

    @Override
    public GetComparacionEstadisticasArbitrosDTO obtenerEstadisticasComparativas(List<Long> idsArbitros, int mesInicio, int mesFin) {
        return designacionEstadisticasService.obtenerEstadisticasComparativas(idsArbitros, mesInicio, mesFin);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO asignarArbitroHistoricoADesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        Arbitro arbitro = buscarArbitro(idArbitro);
        Designados designados = new Designados();
        designados.setArbitro(arbitro);
        designados.setDesignacion(designacion);
        designados.setCategoriaArbitro(arbitro.getCategoria());
        designados.setPartidosDirigidos(0);
        designados.setMontoPercibido(BigDecimal.ZERO);
        designados.setParticipo(null);
        designadosRepository.save(designados);

        if (designacion.getEstadoDesignacion() != 0) {
            registrarAsignacionArbitro(designacion, arbitro, "Asignación histórica");
        }

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            int estadoAnt = designacion.getEstadoDesignacion();
            designacion.setEstadoDesignacion(1);
            designacionRepository.save(designacion);
            registrarCambioEstado(designacion, estadoAnt, 1, "Cuadrilla completada automáticamente");
        } else {
            designacionRepository.save(designacion);
        }

        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Cacheable(value = "designaciones", key = "'ultimasDesignaciones'")
    public List<GetDesignacionDTO> obtenerUltimasDesignaciones() {
        List<GetDesignacionDTO> des = buscarPorFechas(LocalDateTime.now().minusDays(7), LocalDateTime.now().plusDays(10));

        return des.stream().filter(d -> {
            boolean esCancelada = d.getEstadoDesignacion() == 3;
            boolean noEsEditable = !d.getEditable();
            return !(esCancelada && noEsEditable);
        }).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "designaciones", key = "#idDesignacion")
    public GetDesignacionDTO obtenerPorId(Long idDesignacion) {
        return new GetDesignacionDTO(designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada")));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public String sincronizarArancel(Long idDesignacion) {
        try {
            Designacion designacion = designacionRepository.findById(idDesignacion)
                    .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
            if (designacion.getCancha() == null) {
                throw new BadRequestException("La designación no tiene cancha asignada.");
            }
            if (designacion.getCantidadPartidos() == null) {
                throw new BadRequestException("La designación no tiene cantidad de partidos especificada.");
            }

            LocalDate fecha = (designacion.getFecha() != null) ? designacion.getFecha().toLocalDate() : LocalDate.now();
            ArancelArbitral arancelArbitral = buscarArancelVigentePorCancha(designacion.getCancha().getIdCancha(), fecha);
            if (arancelArbitral == null || arancelArbitral.getPrecioPorPartido() == null) {
                throw new BadRequestException("No se encontró arancel vigente para la cancha.");
            }

            List<Designados> arbitrosDesignados = designadosRepository.findByDesignacion_IdDesignacion(designacion.getIdDesignacion());
            if (arbitrosDesignados.isEmpty()) {
                return "No hay árbitros designados para sincronizar.";
            }

            boolean yaTieneMontosAsignados = arbitrosDesignados.stream()
                    .anyMatch(d -> d.getMontoPercibido() != null && d.getMontoPercibido().compareTo(BigDecimal.ZERO) > 0);
            if (yaTieneMontosAsignados) {
                throw new BadRequestException("Los montos de esta designación ya han sido establecidos previamente. No se puede volver a sincronizar automáticamente.");
            }

            int cantidadPartidos = designacion.getCantidadPartidos();
            BigDecimal precioPartido = arancelArbitral.getPrecioPorPartido();
            BigDecimal montoTotal = precioPartido.multiply(BigDecimal.valueOf(cantidadPartidos));
            BigDecimal montoBasePorArbitro = montoTotal.divide(BigDecimal.valueOf(arbitrosDesignados.size()), 2, RoundingMode.HALF_UP);
            BigDecimal montoConViaje = montoBasePorArbitro.add(precioPartido);

            boolean canchaViaje = Boolean.TRUE.equals(designacion.getCancha().getNecesitaViaje());
            Long idPrimerArbitroConAuto = null;
            if (canchaViaje) {
                for (Designados d : arbitrosDesignados) {
                    if (d.getArbitro() != null && (Boolean.TRUE.equals(d.getArbitro().getTieneAuto()) || designacionRuleEngine.esHector(d.getArbitro()))) {
                        idPrimerArbitroConAuto = d.getArbitro().getIdArbitro();
                        break;
                    }
                }
            }

            for (Designados d : arbitrosDesignados) {
                if (canchaViaje && idPrimerArbitroConAuto != null && d.getArbitro() != null && idPrimerArbitroConAuto.equals(d.getArbitro().getIdArbitro())) {
                    d.setMontoPercibido(montoConViaje);
                } else {
                    d.setMontoPercibido(montoBasePorArbitro);
                }
                designadosRepository.save(d);
            }
            return "Aranceles Actualizados";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO reemplazarArbitroEnDesignacion(Long idDesignacion, Long idArbitroActual, Long idArbitroNuevo, String motivo) {
        if (Objects.equals(idArbitroActual, idArbitroNuevo)) {
            throw new BadRequestException("El árbitro nuevo no puede ser igual al árbitro actual.");
        }
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));

        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        Designados actual = designadosActuales.stream()
                .filter(d -> d.getArbitro() != null && Objects.equals(d.getArbitro().getIdArbitro(), idArbitroActual))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("El árbitro actual no se encuentra asignado a esta designación"));

        Arbitro arbitroNuevo = buscarArbitro(idArbitroNuevo);

        List<Designados> cuadrillaSinActual = designadosActuales.stream()
                .filter(d -> !Objects.equals(d.getArbitro().getIdArbitro(), idArbitroActual))
                .collect(Collectors.toList());

        designacionRuleEngine.validarAsignacion(designacion, arbitroNuevo, cuadrillaSinActual, false);

        String motivoSalida = (motivo != null && !motivo.trim().isEmpty())
                ? "Reemplazado por " + arbitroNuevo.getNombreCompleto() + ": " + motivo.trim()
                : "Reemplazado por " + arbitroNuevo.getNombreCompleto();
        registrarBajaArbitro(idDesignacion, actual.getArbitro(), motivoSalida, false);
        designadosRepository.delete(actual);

        Designados nuevoDesignado = new Designados();
        nuevoDesignado.setArbitro(arbitroNuevo);
        nuevoDesignado.setDesignacion(designacion);
        nuevoDesignado.setCategoriaArbitro(arbitroNuevo.getCategoria());
        nuevoDesignado.setPartidosDirigidos(0);
        nuevoDesignado.setMontoPercibido(BigDecimal.ZERO);
        nuevoDesignado.setParticipo(null);
        designadosRepository.save(nuevoDesignado);

        String motivoEntrada = "Ingresa en reemplazo de " + actual.getArbitro().getNombreCompleto();
        registrarAsignacionArbitro(designacion, arbitroNuevo, motivoEntrada);

        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetHistorialEstadoDTO> obtenerHistorialEstados(Long idDesignacion) {
        if (!designacionRepository.existsById(idDesignacion)) {
            throw new NotFoundException("Designacion no encontrada con ID: " + idDesignacion);
        }
        return historialEstadoDesignacionRepository
                .findByDesignacion_IdDesignacionOrderByFechaCambioAsc(idDesignacion)
                .stream()
                .map(GetHistorialEstadoDTO::new)
                .toList();
    }

    @Override
    public List<GetHistorialArbitroDTO> obtenerHistorialArbitros(Long idDesignacion) {
        if (!designacionRepository.existsById(idDesignacion)) {
            throw new NotFoundException("Designacion no encontrada con ID: " + idDesignacion);
        }
        return historialArbitroDesignacionRepository
                .findByDesignacion_IdDesignacionOrderByFechaAsignacionAsc(idDesignacion)
                .stream()
                .map(GetHistorialArbitroDTO::new)
                .toList();
    }

    private String obtenerUsuarioActual() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception ignored) {
        }
        return "SISTEMA";
    }

    private String descripcionEstado(Integer estado) {
        if (estado == null) return "Desconocido";
        return switch (estado) {
            case 0 -> "Pendiente a completar";
            case 1 -> "Aceptada";
            case 2 -> "Jornada finalizada";
            case 3 -> "Jornada cancelada";
            case 4 -> "Suspendida en juego";
            case 5 -> "Suspendida / Por reprogramar";
            default -> "Estado " + estado;
        };
    }

    private void registrarCambioEstado(Designacion designacion, Integer estadoAnterior, Integer estadoNuevo, String motivo) {
        HistorialEstadoDesignacion historial = HistorialEstadoDesignacion.builder()
                .designacion(designacion)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(estadoNuevo)
                .descripcionEstadoAnterior(descripcionEstado(estadoAnterior))
                .descripcionEstadoNuevo(descripcionEstado(estadoNuevo))
                .fechaCambio(LocalDateTime.now())
                .motivo(motivo)
                .usuario(obtenerUsuarioActual())
                .build();
        historialEstadoDesignacionRepository.save(historial);
    }

    private void registrarAsignacionArbitro(Designacion designacion, Arbitro arbitro, String motivo) {
        HistorialArbitroDesignacion historial = HistorialArbitroDesignacion.builder()
                .designacion(designacion)
                .arbitro(arbitro)
                .fechaAsignacion(LocalDateTime.now())
                .activo(true)
                .participo(null)
                .partidosDirigidos(0)
                .montoPercibido(BigDecimal.ZERO)
                .motivo(motivo != null ? motivo : "Asignación a designación")
                .build();
        historialArbitroDesignacionRepository.save(historial);
    }

    private void registrarBajaArbitro(Long idDesignacion, Arbitro arbitro, String motivo, Boolean participo) {
        Optional<HistorialArbitroDesignacion> opt = historialArbitroDesignacionRepository
                .findFirstByDesignacion_IdDesignacionAndArbitro_IdArbitroAndActivoTrue(idDesignacion, arbitro.getIdArbitro());
        if (opt.isPresent()) {
            HistorialArbitroDesignacion h = opt.get();
            h.setActivo(false);
            h.setFechaDesasignacion(LocalDateTime.now());
            h.setParticipo(participo != null ? participo : false);
            if (motivo != null && !motivo.isBlank()) {
                h.setMotivo(motivo);
            }
            historialArbitroDesignacionRepository.save(h);
        } else {
            Designacion d = designacionRepository.findById(idDesignacion).orElse(null);
            if (d != null) {
                HistorialArbitroDesignacion h = HistorialArbitroDesignacion.builder()
                        .designacion(d)
                        .arbitro(arbitro)
                        .fechaAsignacion(d.getFecha() != null ? d.getFecha() : LocalDateTime.now())
                        .fechaDesasignacion(LocalDateTime.now())
                        .activo(false)
                        .participo(participo != null ? participo : false)
                        .motivo(motivo != null ? motivo : "Baja de designación")
                        .partidosDirigidos(0)
                        .montoPercibido(BigDecimal.ZERO)
                        .build();
                historialArbitroDesignacionRepository.save(h);
            }
        }
    }

    private void registrarSnapshotArbitro(Designacion designacion, Arbitro arbitro, String motivo, Boolean participo, Integer partidos, BigDecimal monto) {
        Optional<HistorialArbitroDesignacion> opt = historialArbitroDesignacionRepository
                .findFirstByDesignacion_IdDesignacionAndArbitro_IdArbitroAndActivoTrue(designacion.getIdDesignacion(), arbitro.getIdArbitro());
        if (opt.isPresent()) {
            HistorialArbitroDesignacion h = opt.get();
            h.setParticipo(participo);
            h.setMotivo(motivo);
            if (partidos != null) h.setPartidosDirigidos(partidos);
            if (monto != null) h.setMontoPercibido(monto);
            historialArbitroDesignacionRepository.save(h);
        } else {
            HistorialArbitroDesignacion h = HistorialArbitroDesignacion.builder()
                    .designacion(designacion)
                    .arbitro(arbitro)
                    .fechaAsignacion(designacion.getFecha() != null ? designacion.getFecha() : LocalDateTime.now())
                    .activo(true)
                    .participo(participo)
                    .partidosDirigidos(partidos != null ? partidos : 0)
                    .montoPercibido(monto != null ? monto : BigDecimal.ZERO)
                    .motivo(motivo)
                    .build();
            historialArbitroDesignacionRepository.save(h);
        }
    }

    private Cancha buscarCancha(Long idCancha) {
        return canchaRepository.findById(idCancha)
                .orElseThrow(() -> new NotFoundException("Cancha no encontrada"));
    }

    private Arbitro buscarArbitro(Long idArbitro) {
        return arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
    }

    private ArancelArbitral buscarArancelVigentePorCancha(Long canchaId, LocalDate fecha) {
        List<ArancelArbitral> porCancha = arancelRepo.findArancelVigentePorCanchaParaFecha(canchaId, fecha);
        if (!porCancha.isEmpty()) {
            return porCancha.get(0);
        }
        List<ArancelArbitral> activosCancha = arancelRepo.findByCancha_IdCanchaAndActivoTrue(canchaId);
        if (!activosCancha.isEmpty()) {
            return activosCancha.get(0);
        }
        return null;
    }

    private List<GetDesignacionDTO> cargarDesignadosPorLotes(List<Designacion> designaciones) {
        if (designaciones == null || designaciones.isEmpty()) return List.of();
        return designaciones.stream().map(GetDesignacionDTO::new).toList();
    }
}

