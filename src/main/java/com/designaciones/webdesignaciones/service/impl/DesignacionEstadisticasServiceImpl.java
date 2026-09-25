package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignacionEstadisticasService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignacionEstadisticasServiceImpl implements DesignacionEstadisticasService {

    private final DesignacionRepository designacionRepository;
    private final DesignadosRepository designadosRepository;
    private final ArbitroRepository arbitroRepository;

    @Override
    public GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin) {
        return obtenerEstadisticas(inicio, fin, "DESC");
    }

    @Override
    public GetEstadisticasDesignacionesDTO obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin, String orden) {
        boolean esAsc = orden != null && orden.trim().equalsIgnoreCase("ASC");
        List<Designacion> designaciones = esAsc
                ? designacionRepository.findByFechaBetweenOrderByFechaAsc(inicio, fin)
                : designacionRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        List<Designados> designados = esAsc
                ? designadosRepository.findByDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(inicio, fin)
                : designadosRepository.findByDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(inicio, fin);

        int totalDesignaciones = designaciones.size();

        int totalPartidosDirigidos = designaciones.stream()
                .filter(d -> d.getEstadoDesignacion() == 2 || d.getEstadoDesignacion() == 4)
                .mapToInt(d -> d.getCantidadPartidos() != null ? d.getCantidadPartidos() : 0)
                .sum();

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

        Map<Long, List<Designados>> arbitroMap = designados.stream()
                .filter(d -> d.getArbitro() != null && d.getArbitro().getIdArbitro() != null)
                .collect(Collectors.groupingBy(d -> d.getArbitro().getIdArbitro()));

        List<ArbitroEstadisticaDTO> estadisticasArbitros = new ArrayList<>();
        for (Map.Entry<Long, List<Designados>> entry : arbitroMap.entrySet()) {
            List<Designados> list = entry.getValue();
            Arbitro a = list.get(0).getArbitro();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0).sum();
            BigDecimal totalMonto = list.stream().map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

            estadisticasArbitros.add(ArbitroEstadisticaDTO.builder()
                    .idArbitro(a.getIdArbitro())
                    .nombreCompleto(a.getNombreCompleto())
                    .totalDesignaciones(totalDes)
                    .totalPartidosDirigidos(totalPartidos)
                    .totalMontoPercibido(totalMonto)
                    .build());
        }
        estadisticasArbitros.sort((a1, a2) -> Integer.compare(a2.getTotalPartidosDirigidos(), a1.getTotalPartidosDirigidos()));

        Map<Long, List<Designacion>> canchaMap = designaciones.stream()
                .filter(d -> d.getCancha() != null && d.getCancha().getIdCancha() != null)
                .collect(Collectors.groupingBy(d -> d.getCancha().getIdCancha()));

        List<CanchaEstadisticaDTO> estadisticasCanchas = new ArrayList<>();
        for (Map.Entry<Long, List<Designacion>> entry : canchaMap.entrySet()) {
            List<Designacion> list = entry.getValue();
            Cancha c = list.get(0).getCancha();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getCantidadPartidos() != null ? d.getCantidadPartidos() : 0).sum();

            int finalizadas = (int) list.stream().filter(d -> d.getEstadoDesignacion() == 2 || d.getEstadoDesignacion() == 4).count();

            estadisticasCanchas.add(CanchaEstadisticaDTO.builder()
                    .idCancha(c.getIdCancha())
                    .nombreCancha(c.getNombreCancha())
                    .detalleDesignacion(list.get(0).getDetalleExtra())
                    .totalDesignaciones(totalDes)
                    .totalPartidos(totalPartidos)
                    .totalDesignacionesFinalizadas(finalizadas)
                    .build());
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
        return obtenerEstadisticasArbitro(idArbitro, inicio, fin, "DESC", 0, 10);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden) {
        return obtenerEstadisticasArbitro(idArbitro, inicio, fin, orden, 0, 10);
    }

    @Override
    public GetEstadisticasArbitroDetalleDTO obtenerEstadisticasArbitro(Long idArbitro, LocalDateTime inicio, LocalDateTime fin, String orden, int page, int size) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Árbitro no encontrado"));

        boolean esAsc = orden != null && orden.trim().equalsIgnoreCase("ASC");
        List<Designados> designados = esAsc
                ? designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(idArbitro, inicio, fin)
                : designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(idArbitro, inicio, fin);

        int totalDesignaciones = designados.size();

        int totalPartidosDirigidos = designados.stream()
                .filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4))
                .mapToInt(d -> d.getDesignacion().getCantidadPartidos() != null ? d.getDesignacion().getCantidadPartidos() : 0)
                .sum();

        BigDecimal totalMonto = designados.stream()
                .map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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

        Map<Long, List<Designados>> canchaMap = designados.stream()
                .filter(d -> d.getDesignacion() != null && d.getDesignacion().getCancha() != null)
                .collect(Collectors.groupingBy(d -> d.getDesignacion().getCancha().getIdCancha()));

        List<CanchaEstadisticaDTO> estadisticasCanchas = new ArrayList<>();
        for (Map.Entry<Long, List<Designados>> entry : canchaMap.entrySet()) {
            List<Designados> list = entry.getValue();
            Cancha c = list.get(0).getDesignacion().getCancha();

            int totalDes = list.size();
            int totalPartidos = list.stream().mapToInt(d -> d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0).sum();

            int finalizadas = (int) list.stream().filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4)).count();

            estadisticasCanchas.add(CanchaEstadisticaDTO.builder()
                    .idCancha(c.getIdCancha())
                    .nombreCancha(c.getNombreCancha())
                    .detalleDesignacion(list.get(0).getDesignacion().getDetalleExtra())
                    .totalDesignaciones(totalDes)
                    .totalPartidos(totalPartidos)
                    .totalDesignacionesFinalizadas(finalizadas)
                    .build());
        }
        estadisticasCanchas.sort((c1, c2) -> Integer.compare(c2.getTotalPartidos(), c1.getTotalPartidos()));

        int validPage = Math.max(0, page);
        int validSize = size > 0 ? size : 10;
        int fromIndex = Math.min(validPage * validSize, estadisticasCanchas.size());
        int toIndex = Math.min(fromIndex + validSize, estadisticasCanchas.size());
        List<CanchaEstadisticaDTO> subList = estadisticasCanchas.subList(fromIndex, toIndex);
        Page<CanchaEstadisticaDTO> canchasPaged = new PageImpl<>(subList, PageRequest.of(validPage, validSize), estadisticasCanchas.size());

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

        return GetEstadisticasArbitroDetalleDTO.builder()
                .idArbitro(arbitro.getIdArbitro())
                .nombreCompleto(arbitro.getNombreCompleto())
                .totalDesignaciones(totalDesignaciones)
                .totalPartidosDirigidos(totalPartidosDirigidos)
                .totalMontoPercibido(totalMonto)
                .designacionesPorEstado(designacionesPorEstado)
                .estadisticasCanchas(canchasPaged)
                .designacionesPorCategoria(designacionesPorCategoria)
                .build();
    }

    @Override
    public GetComparacionEstadisticasArbitrosDTO obtenerEstadisticasComparativas(List<Long> idsArbitros, int mesInicio, int mesFin) {
        int anioActual = LocalDate.now().getYear();
        LocalDateTime inicio = YearMonth.of(anioActual, mesInicio).atDay(1).atStartOfDay();
        LocalDateTime fin = YearMonth.of(anioActual, mesFin).atEndOfMonth().atTime(LocalTime.MAX);

        List<ArbitroComparacionDTO> comparacionList = new ArrayList<>();

        for (Long idArbitro : idsArbitros) {
            Arbitro arbitro = arbitroRepository.findById(idArbitro)
                    .orElseThrow(() -> new NotFoundException("Árbitro no encontrado con ID: " + idArbitro));

            List<Designados> designados = designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetween(idArbitro, inicio, fin);

            int totalDesignaciones = designados.size();

            int totalPartidosDirigidos = designados.stream()
                    .filter(d -> d.getDesignacion() != null && (d.getDesignacion().getEstadoDesignacion() == 2 || d.getDesignacion().getEstadoDesignacion() == 4))
                    .mapToInt(d -> d.getDesignacion().getCantidadPartidos() != null ? d.getDesignacion().getCantidadPartidos() : 0)
                    .sum();

            BigDecimal totalMonto = designados.stream()
                    .map(d -> d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

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

                    detalles.add(DesignacionResumenDTO.builder()
                            .idDesignacion(d.getDesignacion().getIdDesignacion())
                            .fecha(d.getDesignacion().getFecha())
                            .nombreCancha(d.getDesignacion().getCancha() != null ? d.getDesignacion().getCancha().getNombreCancha() : null)
                            .etapaCampeonato(d.getDesignacion().getEtapaCampeonato() != null ? d.getDesignacion().getEtapaCampeonato().name() : null)
                            .cantidadPartidos(esCancelada ? 0 : d.getDesignacion().getCantidadPartidos())
                            .estadoDesignacion(estadoStr)
                            .detalle(d.getDesignacion().getDetalleExtra())
                            .categoriaArbitroEnDesignacion(d.getCategoriaArbitro() != null ? d.getCategoriaArbitro().name() : null)
                            .partidosDirigidos(esCancelada ? 0 : (d.getPartidosDirigidos() != null ? d.getPartidosDirigidos() : 0))
                            .montoPercibido(d.getMontoPercibido() != null ? d.getMontoPercibido() : BigDecimal.ZERO)
                            .build());
                }
            }

            comparacionList.add(ArbitroComparacionDTO.builder()
                    .idArbitro(arbitro.getIdArbitro())
                    .nombreCompleto(arbitro.getNombre() + " " + arbitro.getApellido())
                    .totalDesignaciones(totalDesignaciones)
                    .totalPartidosDirigidos(totalPartidosDirigidos)
                    .totalMontoPercibido(totalMonto)
                    .designacionesPorEstado(designacionesPorEstado)
                    .designacionesDetalle(detalles)
                    .build());
        }

        return GetComparacionEstadisticasArbitrosDTO.builder().comparacionArbitros(comparacionList).build();
    }
}
