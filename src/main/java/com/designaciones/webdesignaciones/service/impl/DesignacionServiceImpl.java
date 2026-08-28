package com.designaciones.webdesignaciones.service.impl;


import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
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
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignacionServiceImpl implements DesignacionService {

    private final DesignacionRepository designacionRepository;
    private final CanchaRepository canchaRepository;
    private final ArbitroRepository arbitroRepository;
    private final DesignadosRepository designadosRepository;
    private final SuspencionRepository suspencionRepository;
    private final ArancelRepo arancelRepo;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO) {
        Designacion designacion = Designacion.builder().fecha(designacionDTO.getFecha()).cancha(buscarCancha(designacionDTO.getIdCancha())).etapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato())).cantidadPartidos(designacionDTO.getCantidadPartidos()).estadoDesignacion(0).editable(true).detalleExtra("Designación creada correctamente y sin detalles").build();
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
    @Cacheable(value = "designados", key = "#idDesignacion")
    public List<GetDesignadosDTO> obtenerArbitrosDesignados(Long idDesignacion) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return designados.stream().map(GetDesignadosDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public void eliminarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        boolean recalcularArancel = false;

        if (designacionDTO.getFecha() != null) {
            designacion.setFecha(designacionDTO.getFecha());
            recalcularArancel = true;
        }
        if (designacionDTO.getIdCancha() != null) {
            designacion.setCancha(buscarCancha(designacionDTO.getIdCancha()));
            recalcularArancel = true;
        }
        if (designacionDTO.getEtapaCampeonato() != null) {
            designacion.setEtapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato()));
        }
        if (designacionDTO.getCantidadPartidos() != null) {
            designacion.setCantidadPartidos(designacionDTO.getCantidadPartidos());
            recalcularArancel = true;
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
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
            Designados nuevaDesignacionArbitro = Designados.builder().arbitro(arbitro).categoriaArbitro(arbitro.getCategoria()).designacion(nuevaDesignacion).partidosDirigidos(0).build();
            nuevaDesignacionArbitro.setDesignacion(nuevaDesignacion);
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));
        List<Designados> designado = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        Designados aEliminar = designado.stream().filter(d -> Objects.equals(d.getArbitro().getIdArbitro(), idArbitro)).findFirst().orElseThrow(() -> new BadRequestException("El árbitro no está asignado a esta designación"));
        designadosRepository.delete(aEliminar);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);

        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
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
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));

        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new BadRequestException("La designación no tiene una cancha asignada.");
        }

        Arbitro arbitro = buscarArbitro(idArbitro);

        if (!forzarEtapa && !esArbitroAptoParaEtapa(arbitro.getCategoria(), designacion.getEtapaCampeonato())) {
            throw new BadRequestException("No se puede asignar: la categoría del árbitro (" + arbitro.getCategoria() + ") no es apta para la etapa (" + designacion.getEtapaCampeonato() + ")");
        }

        if (tieneArbitroSuspencionActiva(arbitro, designacion.getFecha(), designacion.getCancha())) {
            throw new BadRequestException("No se puede asignar: el árbitro tiene una suspensión activa en la fecha de la designación");
        }

        boolean esHectorArbitro = esHector(arbitro);
        boolean necesitaViaje = Boolean.TRUE.equals(designacion.getCancha().getNecesitaViaje());

        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        boolean yaEstaAsignado = designadosActuales.stream()
                .anyMatch(d -> d.getArbitro() != null && Objects.equals(d.getArbitro().getIdArbitro(), idArbitro));
        if (yaEstaAsignado) {
            throw new BadRequestException("No se puede asignar: el árbitro ya se encuentra asignado a esta designación.");
        }

        // Validar cantidad de designaciones en la misma fecha (mismo día)
        if (designacion.getFecha() != null) {
            LocalDate fechaLocal = designacion.getFecha().toLocalDate();
            LocalDateTime start = fechaLocal.atStartOfDay();
            LocalDateTime end = fechaLocal.atTime(LocalTime.MAX);

            Long asignacionesEnFecha = designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(
                    arbitro.getIdArbitro(), start, end, idDesignacion);

            if (asignacionesEnFecha != null) {
                if (esHectorArbitro) {
                    if (asignacionesEnFecha >= 2) {
                        throw new BadRequestException("No se puede asignar: Héctor Mendoza ya cuenta con el máximo permitido de 2 designaciones para esta fecha.");
                    }
                } else {
                    if (asignacionesEnFecha >= 1) {
                        throw new BadRequestException("No se puede asignar: el árbitro ya tiene una designación asignada para esta fecha.");
                    }
                }
            }
        }

        if (esHectorArbitro && !necesitaViaje) {
            throw new BadRequestException("No se puede asignar: Héctor Mendoza es chofer y solo puede ser asignado a canchas que necesiten viaje.");
        }

        if (necesitaViaje) {
            boolean yaTieneVehiculo = designadosActuales.stream().anyMatch(d -> tieneVehiculoOEsHector(d.getArbitro()));

            if (!yaTieneVehiculo && !tieneVehiculoOEsHector(arbitro)) {
                int totalNecesarios = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
                int libres = totalNecesarios - designadosActuales.size();
                if (libres <= 1) {
                    throw new BadRequestException("No se puede asignar: la cancha requiere viaje y la cuadrilla no cuenta con ningún vehículo o chofer asignado.");
                }
            }
        }

        if (!forzarEtapa) {
            Optional<Designacion> ultimaDesignacionPrevia = designacionRepository.findFirstByCancha_IdCanchaAndFechaBeforeAndEstadoDesignacionNotOrderByFechaDesc(canchaId, designacion.getFecha(), 3);

            if (ultimaDesignacionPrevia.isPresent()) {
                Designacion designacionAnterior = ultimaDesignacionPrevia.get();
                List<Designados> arbitrosPrevios = designadosRepository.findByDesignacion_IdDesignacion(designacionAnterior.getIdDesignacion());

                boolean arbitroEstuvoEnCanchaAnterior = arbitrosPrevios.stream()
                        .anyMatch(d -> d.getArbitro() != null && d.getArbitro().getIdArbitro().equals(idArbitro));

                if (arbitroEstuvoEnCanchaAnterior && !esHectorArbitro) {
                    throw new BadRequestException("No se puede asignar: el árbitro ya estuvo en esta cancha en la última fecha disputada en ella.");
                }
            }
        }

        Designados designados = new Designados();
        designados.setArbitro(arbitro);
        designados.setDesignacion(designacion);
        designados.setCategoriaArbitro(arbitro.getCategoria());
        designados.setPartidosDirigidos(0);

        designadosRepository.save(designados);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            designacion.setEstadoDesignacion(1);
        }
        designacionRepository.save(designacion);

        return new GetDesignacionDTO(designacion);
    }

    @Override
    public GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin) {
        List<Designacion> designaciones = designacionRepository.findByFechaBetween(inicio, fin);
        List<Designados> designados = designadosRepository.findByDesignacion_FechaBetween(inicio, fin);

        int totalDesignaciones = designaciones.size();

        int totalPartidosDirigidos = designaciones.stream().filter(d -> d.getEstadoDesignacion() == 2 || d.getEstadoDesignacion() == 4).mapToInt(d -> d.getCantidadPartidos() != null ? d.getCantidadPartidos() : 0).sum();

        Map<String, Integer> designacionesPorEstado = new HashMap<>();
        designacionesPorEstado.put("Pendiente", 0);
        designacionesPorEstado.put("Aceptada", 0);
        designacionesPorEstado.put("Finalizada", 0);
        designacionesPorEstado.put("Cancelada", 0);
        designacionesPorEstado.put("Suspendida", 0);

        for (Designacion d : designaciones) {
            switch (d.getEstadoDesignacion()) {
                case 0 -> designacionesPorEstado.put("Pendiente", designacionesPorEstado.get("Pendiente") + 1);
                case 1 -> designacionesPorEstado.put("Aceptada", designacionesPorEstado.get("Aceptada") + 1);
                case 2 -> designacionesPorEstado.put("Finalizada", designacionesPorEstado.get("Finalizada") + 1);
                case 3 -> designacionesPorEstado.put("Cancelada", designacionesPorEstado.get("Cancelada") + 1);
                case 4 -> designacionesPorEstado.put("Suspendida", designacionesPorEstado.get("Suspendida") + 1);
            }
        }

        Map<Long, List<Designados>> arbitroMap = designados.stream().filter(d -> d.getArbitro() != null && d.getArbitro().getIdArbitro() != null).collect(Collectors.groupingBy(d -> d.getArbitro().getIdArbitro()));

        List<ArbitroEstadisticaDTO> estadisticasArbitros = new ArrayList<>();
        for (Map.Entry<Long, List<Designados>> entry : arbitroMap.entrySet()) {
            List<Designados> list = entry.getValue();
            Arbitro a = list.get(0).getArbitro();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0).sum();
            BigDecimal totalMonto = list.stream().map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

            estadisticasArbitros.add(ArbitroEstadisticaDTO.builder().idArbitro(a.getIdArbitro()).nombreCompleto(a.getNombreCompleto()).totalDesignaciones(totalDes).totalPartidosDirigidos(totalPartidos).totalMontoPercibido(totalMonto).build());
        }
        estadisticasArbitros.sort((a1, a2) -> Integer.compare(a2.getTotalPartidosDirigidos(), a1.getTotalPartidosDirigidos()));

        Map<Long, List<Designacion>> canchaMap = designaciones.stream().filter(d -> d.getCancha() != null && d.getCancha().getIdCancha() != null).collect(Collectors.groupingBy(d -> d.getCancha().getIdCancha()));

        List<CanchaEstadisticaDTO> estadisticasCanchas = new ArrayList<>();
        for (Map.Entry<Long, List<Designacion>> entry : canchaMap.entrySet()) {
            List<Designacion> list = entry.getValue();
            Cancha c = list.get(0).getCancha();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getCantidadPartidos() != null ? d.getCantidadPartidos() : 0).sum();

            int finalizadas = (int) list.stream().filter(d -> d.getEstadoDesignacion() == 2 || d.getEstadoDesignacion() == 4).count();

            estadisticasCanchas.add(CanchaEstadisticaDTO.builder().idCancha(c.getIdCancha()).nombreCancha(c.getNombreCancha()).totalDesignaciones(totalDes).totalPartidos(totalPartidos).totalDesignacionesFinalizadas(finalizadas).build());
        }
        estadisticasCanchas.sort((c1, c2) -> Integer.compare(c2.getTotalPartidos(), c1.getTotalPartidos()));

        Map<String, Integer> designacionesPorCategoria = new HashMap<>();
        for (CategoriaArbitro cat : CategoriaArbitro.values()) {
            designacionesPorCategoria.put(cat.name(), 0);
        }
        for (Designados d : designados) {
            if (d.getCategoriaArbitro() != null) {
                String catName = d.getCategoriaArbitro().name();
                designacionesPorCategoria.put(catName, designacionesPorCategoria.getOrDefault(catName, 0) + 1);
            }
        }
        return new GetEstadisticasDesignacionesDTO(totalDesignaciones, totalPartidosDirigidos, designacionesPorEstado, estadisticasArbitros, estadisticasCanchas, designacionesPorCategoria);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new NotFoundException("Árbitro no encontrado"));

        List<Designados> designados = designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetween(idArbitro, inicio, fin);

        int totalDesignaciones = designados.size();

        int totalPartidosDirigidos = designados.stream().filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4)).mapToInt(d -> d.getDesignacion().getCantidadPartidos() != null ? d.getDesignacion().getCantidadPartidos() : 0).sum();

        BigDecimal totalMonto = designados.stream().map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Integer> designacionesPorEstado = new HashMap<>();
        designacionesPorEstado.put("Pendiente", 0);
        designacionesPorEstado.put("Aceptada", 0);
        designacionesPorEstado.put("Finalizada", 0);
        designacionesPorEstado.put("Cancelada", 0);
        designacionesPorEstado.put("Suspendida", 0);

        for (Designados d : designados) {
            if (d.getDesignacion() != null) {
                switch (d.getDesignacion().getEstadoDesignacion()) {
                    case 0 -> designacionesPorEstado.put("Pendiente", designacionesPorEstado.get("Pendiente") + 1);
                    case 1 -> designacionesPorEstado.put("Aceptada", designacionesPorEstado.get("Aceptada") + 1);
                    case 2 -> designacionesPorEstado.put("Finalizada", designacionesPorEstado.get("Finalizada") + 1);
                    case 3 -> designacionesPorEstado.put("Cancelada", designacionesPorEstado.get("Cancelada") + 1);
                    case 4 -> designacionesPorEstado.put("Suspendida", designacionesPorEstado.get("Suspendida") + 1);
                }
            }
        }

        Map<Long, List<Designados>> canchaMap = designados.stream().filter(d -> d.getDesignacion() != null && d.getDesignacion().getCancha() != null).collect(Collectors.groupingBy(d -> d.getDesignacion().getCancha().getIdCancha()));

        List<CanchaEstadisticaDTO> estadisticasCanchas = new ArrayList<>();
        for (Map.Entry<Long, List<Designados>> entry : canchaMap.entrySet()) {
            List<Designados> list = entry.getValue();
            Cancha c = list.get(0).getDesignacion().getCancha();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0).sum();

            int finalizadas = (int) list.stream().filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4)).count();

            estadisticasCanchas.add(CanchaEstadisticaDTO.builder().idCancha(c.getIdCancha()).nombreCancha(c.getNombreCancha()).totalDesignaciones(totalDes).totalPartidos(totalPartidos).totalDesignacionesFinalizadas(finalizadas).build());
        }
        estadisticasCanchas.sort((c1, c2) -> Integer.compare(c2.getTotalPartidos(), c1.getTotalPartidos()));

        Map<String, Integer> designacionesPorCategoria = new HashMap<>();
        for (CategoriaArbitro cat : CategoriaArbitro.values()) {
            designacionesPorCategoria.put(cat.name(), 0);
        }
        for (Designados d : designados) {
            if (d.getCategoriaArbitro() != null) {
                String catName = d.getCategoriaArbitro().name();
                designacionesPorCategoria.put(catName, designacionesPorCategoria.getOrDefault(catName, 0) + 1);
            }
        }

        return GetEstadisticasArbitroDetalleDTO.builder().idArbitro(arbitro.getIdArbitro()).nombreCompleto(arbitro.getNombreCompleto()).totalDesignaciones(totalDesignaciones).totalPartidosDirigidos(totalPartidosDirigidos).totalMontoPercibido(totalMonto).designacionesPorEstado(designacionesPorEstado).estadisticasCanchas(estadisticasCanchas).designacionesPorCategoria(designacionesPorCategoria).build();
    }

    @Override
    public GetComparacionEstadisticasArbitrosDTO obtenerEstadisticasComparativas(List<Long> idsArbitros, int mesInicio, int mesFin) {
        // 1. Obtenemos el año actual para contextualizar los meses
        int anioActual = LocalDate.now().getYear();

        // 2. Calculamos el primer segundo del primer día del mes de inicio (Ej: 2026-01-01T00:00:00)
        LocalDateTime inicio = YearMonth.of(anioActual, mesInicio).atDay(1).atStartOfDay();

        // 3. Calculamos el último nanosegundo del último día del mes de fin (Ej: 2026-03-31T23:59:59.999999999)
        LocalDateTime fin = YearMonth.of(anioActual, mesFin).atEndOfMonth().atTime(LocalTime.MAX);

        List<ArbitroComparacionDTO> comparacionList = new ArrayList<>();

        for (Long idArbitro : idsArbitros) {
            Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new NotFoundException("Árbitro no encontrado con ID: " + idArbitro));

            // Ahora 'inicio' y 'fin' ya están correctamente definidos como LocalDateTime
            List<Designados> designados = designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetween(idArbitro, inicio, fin);

            int totalDesignaciones = designados.size();

            int totalPartidosDirigidos = designados.stream().filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4)).mapToInt(d -> d.getDesignacion().getCantidadPartidos() != null ? d.getDesignacion().getCantidadPartidos() : 0).sum();

            BigDecimal totalMonto = designados.stream().map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Integer> designacionesPorEstado = new HashMap<>();
            designacionesPorEstado.put("Finalizada", 0);
            designacionesPorEstado.put("Cancelada", 0);
            designacionesPorEstado.put("Suspendida", 0);

            List<DesignacionResumenDTO> detalles = new ArrayList<>();

            for (Designados d : designados) {
                if (d.getDesignacion() != null) {
                    String estadoStr = switch (d.getDesignacion().getEstadoDesignacion()) {
                        case 2 -> {
                            designacionesPorEstado.put("Finalizada", designacionesPorEstado.get("Finalizada") + 1);
                            yield "Finalizada";
                        }
                        case 3 -> {
                            designacionesPorEstado.put("Cancelada", designacionesPorEstado.get("Cancelada") + 1);
                            yield "Cancelada";
                        }
                        case 4 -> {
                            designacionesPorEstado.put("Suspendida", designacionesPorEstado.getOrDefault("Suspendida", 0) + 1);
                            yield "Suspendida";
                        }
                        default -> "Desconocido";
                    };

                    boolean esCancelada = d.getDesignacion().getEstadoDesignacion() == 3;
                    detalles.add(DesignacionResumenDTO.builder().idDesignacion(d.getDesignacion().getIdDesignacion()).fecha(d.getDesignacion().getFecha()).nombreCancha(d.getDesignacion().getCancha() != null ? d.getDesignacion().getCancha().getNombreCancha() : null).etapaCampeonato(d.getDesignacion().getEtapaCampeonato() != null ? d.getDesignacion().getEtapaCampeonato().name() : null).cantidadPartidos(esCancelada ? 0 : d.getDesignacion().getCantidadPartidos()).estadoDesignacion(estadoStr).detalle(d.getDesignacion().getDetalleExtra()).categoriaArbitroEnDesignacion(d.getCategoriaArbitro() != null ? d.getCategoriaArbitro().name() : null).partidosDirigidos(esCancelada ? 0 : (d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0)).montoPercibido(d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO).build());
                }
            }

            comparacionList.add(ArbitroComparacionDTO.builder().idArbitro(arbitro.getIdArbitro()).nombreCompleto(arbitro.getNombre() + " " + arbitro.getApellido()).totalDesignaciones(totalDesignaciones).totalPartidosDirigidos(totalPartidosDirigidos).totalMontoPercibido(totalMonto).designacionesPorEstado(designacionesPorEstado).designacionesDetalle(detalles).build());
        }

        return GetComparacionEstadisticasArbitrosDTO.builder().comparacionArbitros(comparacionList).build();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public GetDesignacionDTO asignarArbitroHistoricoADesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        Arbitro arbitro = buscarArbitro(idArbitro);
        Designados designados = new Designados();
        designados.setArbitro(arbitro);
        designados.setDesignacion(designacion);
        designados.setCategoriaArbitro(arbitro.getCategoria());
        designados.setPartidosDirigidos(0);
        designadosRepository.save(designados);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());

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
        return new GetDesignacionDTO(designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada")));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public String sincronizarArancel(Long idDesignacion) {
        try {
            Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
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
                    if (d.getArbitro() != null && (Boolean.TRUE.equals(d.getArbitro().getTieneAuto()) || esHector(d.getArbitro()))) {
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
        return designadosRepository.findByDesignacion_IdDesignacion(designacion.getIdDesignacion()).stream().map(d -> d.getArbitro()).toList();
    }

    private boolean tieneArbitroSuspencionActiva(Arbitro arbitro, LocalDateTime fechaDesignacion, Cancha cancha) {
        if (arbitro == null || fechaDesignacion == null || cancha == null) {
            return false;
        }
        List<Suspencion> suspensiones = suspencionRepository.findByArbitroAndCancha(arbitro, cancha);
        LocalDate fecha = fechaDesignacion.toLocalDate();

        return suspensiones.stream().anyMatch(sus -> sus.getTipoSuspencion() == 2 && !fecha.isBefore(sus.getFechaIncidente().toLocalDate()) && !fecha.isAfter(sus.getFechaFin().toLocalDate()));
    }

    private boolean tieneCualquierSuspencionActiva(Arbitro arbitro, LocalDateTime fechaDesignacion) {
        if (arbitro == null || fechaDesignacion == null) {
            return false;
        }
        Page<Suspencion> pagina = suspencionRepository.findByArbitro(arbitro, PageRequest.of(0, 100));
        LocalDate fecha = fechaDesignacion.toLocalDate();
        return pagina.getContent().stream().anyMatch(sus -> sus.getTipoSuspencion() == 2 && !fecha.isBefore(sus.getFechaIncidente().toLocalDate()) && !fecha.isAfter(sus.getFechaFin().toLocalDate()));
    }

    private boolean esHector(Arbitro a) {
        if (a == null) return false;
        if (Long.valueOf(35L).equals(a.getIdArbitro())) return true;
        if (a.getWhatsapp() != null) {
            String cleanPhone = a.getWhatsapp().replaceAll("[^0-9]", "");
            if (cleanPhone.contains("5493743452732") || cleanPhone.contains("3743452732")) {
                return true;
            }
        }
        if (a.getNombre() != null && a.getApellido() != null) {
            String completo = (a.getNombre() + " " + a.getApellido()).toLowerCase();
            return completo.contains("hector") && completo.contains("mendoza");
        }
        return false;
    }

    private boolean tieneVehiculoOEsHector(Arbitro a) {
        if (a == null) return false;
        return Boolean.TRUE.equals(a.getTieneAuto()) || esHector(a);
    }

    private boolean esArbitroAptoParaEtapa(CategoriaArbitro categoria, EtapaCampeonato etapa) {
        if (categoria == null || etapa == null) {
            return false;
        }

        switch (etapa) {
            case FINAL:
            case SEMIFINAL:
            case FECHA_PICANTE:
                return categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.INTERMEDIO || categoria == CategoriaArbitro.PRINCIPAL_1;

            case CRUCES:
            case CLASIFICACION:
                return categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.INTERMEDIO || categoria == CategoriaArbitro.PRINCIPAL_1 || categoria == CategoriaArbitro.PRINCIPAL_2 || categoria == CategoriaArbitro.PRINCIPAL_3;

            case FECHA_NORMAL:
                // CORRECCIÓN: Ahora retorna 'true'. Permitimos que el pool de candidatos
                // incluya a todos. La lógica de exigir 1 intermedio se maneja en el asignador.
                return true;

            default:
                return true;
        }
    }

    private Cancha buscarCancha(Long idCancha) {
        return canchaRepository.findById(idCancha).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Cancha no encontrada"));
    }

    private Arbitro buscarArbitro(Long idArbitro) {
        return arbitroRepository.findById(idArbitro).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Arbitro no encontrado"));
    }

    private int calcularArbitrosNecesarios(Integer cantidadPartidos) {
        if (cantidadPartidos == null || cantidadPartidos <= 4) {
            return 3;
        } else if (cantidadPartidos <= 6) {
            return 4;
        } else {
            return 4 + (cantidadPartidos - 5) / 2;
        }
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


    private boolean esIntermedioOSuperior(CategoriaArbitro categoria) {
        if (categoria == null) return false;

        return categoria == CategoriaArbitro.INTERMEDIO || categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.PRINCIPAL_1;
    }

    private void validarCategoryRecristriccionInicialFormacionArbitros(Designacion designacion, CategoriaArbitro categoriaAAsginar, List<Arbitro> arbitrosSeleccionados) {
        if (designacion.getEtapaCampeonato() != EtapaCampeonato.FECHA_NORMAL) {
            return;
        }
        if (categoriaAAsginar != CategoriaArbitro.INICIAL) {
            return;
        }

        long cantidadInicial = arbitrosSeleccionados.stream().filter(a -> a.getCategoria() == CategoriaArbitro.INICIAL).count();

        // Validaciones
        if (categoriaAAsginar == CategoriaArbitro.INICIAL) {
            if (cantidadInicial >= 1) {
                throw new BadRequestException("No se puede asignar más de 1 árbitro de categoría INICIAL a una designación en FECHA_NORMAL.");
            }
        } else {
            // El único otro caso válido es EN_FORMACION
            if (cantidadInicial > 0) {
                throw new BadRequestException("No se puede asignar un árbitro de categoría EN_FORMACION a una designación que ya tiene un árbitro INICIAL.");
            }
        }
    }

    private List<GetDesignacionDTO> cargarDesignadosPorLotes(List<Designacion> designaciones) {
        if (designaciones.isEmpty()) return List.of();

        List<Long> ids = designaciones.stream().map(Designacion::getIdDesignacion).collect(Collectors.toList());

        Map<Long, List<Designados>> designadosPorDesignacion = designadosRepository.findByDesignacion_IdDesignacionIn(ids).stream().collect(Collectors.groupingBy(d -> d.getDesignacion().getIdDesignacion()));

        return designaciones.stream().map(GetDesignacionDTO::new).toList();
    }


}
