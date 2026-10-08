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
        designacion.setEstadoDesignacion(2);
        designacion.setEditable(false);
        if (detalle != null && !detalle.trim().isEmpty()) {
            designacion.setDetalleExtra(detalle.trim());
        } else if (designacion.getDetalleExtra() == null || designacion.getDetalleExtra().isEmpty()) {
            designacion.setDetalleExtra("Designación finalizada y sin detalle adicional");
        }
        designacionRepository.save(designacion);
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
        designacion.setEstadoDesignacion(3);
        designacion.setDetalleExtra(detalle);
        designacion.setEditable(true);
        designacionRepository.save(designacion);
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
        designacion.setEstadoDesignacion(1);
        designacion.setDetalleExtra("Designación aceptada");
        designacion.setEditable(true);
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO reprogramarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        if (designacion.getEstadoDesignacion() == 4) {
            designacion.setDetalleExtra("Jornada suspendida en cancha!" + " " + designacion.getDetalleExtra());
        } else {
            designacion.setEstadoDesignacion(3);
            designacion.setDetalleExtra(designacion.getDetalleExtra() + " " + "Jornada suspendida y reprogramada");
        }
        designacion.setEditable(false);
        designacionRepository.save(designacion);
        Designacion nuevaDesignacion = reprogramarDesignacion(designacion);
        designacionRepository.save(nuevaDesignacion);
        for (Arbitro arbitro : designadosPrevios(designacion)) {
            Designados nuevaDesignacionArbitro = Designados.builder()
                    .arbitro(arbitro)
                    .categoriaArbitro(arbitro.getCategoria())
                    .designacion(nuevaDesignacion)
                    .partidosDirigidos(0)
                    .build();
            designadosRepository.save(nuevaDesignacionArbitro);
        }
        designacionRepository.save(nuevaDesignacion);
        return new GetDesignacionDTO(nuevaDesignacion);
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
        designadosRepository.delete(aEliminar);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);

        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        if (designadosActualizados.size() < needed && designacion.getEstadoDesignacion() == 1) {
            designacion.setEstadoDesignacion(0);
            designacionRepository.save(designacion);
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
        designadosRepository.save(designados);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            designacion.setEstadoDesignacion(1);
        }
        designacionRepository.save(designacion);

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
        designadosRepository.save(designados);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = designacionRuleEngine.calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            designacion.setEstadoDesignacion(1);
        }
        designacionRepository.save(designacion);

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

    private Designacion reprogramarDesignacion(Designacion designacionVieja) {
        Designacion nuevaDesignacion = new Designacion();
        nuevaDesignacion.setEtapaCampeonato(designacionVieja.getEtapaCampeonato());
        nuevaDesignacion.setFecha(designacionVieja.getFecha().plusDays(7));
        nuevaDesignacion.setCantidadPartidos(designacionVieja.getCantidadPartidos());
        nuevaDesignacion.setEstadoDesignacion(0);
        nuevaDesignacion.setDetalleExtra("Designacion repogramada y aceptada");
        nuevaDesignacion.setCancha(designacionVieja.getCancha());
        nuevaDesignacion.setEditable(true);
        return nuevaDesignacion;
    }

    private List<Arbitro> designadosPrevios(Designacion designacion) {
        return designadosRepository.findByDesignacion_IdDesignacion(designacion.getIdDesignacion())
                .stream().map(Designados::getArbitro).toList();
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
        if (designaciones.isEmpty()) return List.of();
        List<Long> ids = designaciones.stream().map(Designacion::getIdDesignacion).collect(Collectors.toList());
        designadosRepository.findByDesignacion_IdDesignacionIn(ids).stream().collect(Collectors.groupingBy(d -> d.getDesignacion().getIdDesignacion()));
        return designaciones.stream().map(GetDesignacionDTO::new).toList();
    }
}

