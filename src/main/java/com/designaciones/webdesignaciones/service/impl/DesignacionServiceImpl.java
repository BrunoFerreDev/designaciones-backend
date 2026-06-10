package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.post.DesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.DesignacionService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO) {
        Designacion designacion = Designacion.builder().fecha(designacionDTO.getFecha()).cancha(buscarCancha(designacionDTO.getIdCancha())).etapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato())).cantidadPartidos(designacionDTO.getCantidadPartidos()).estadoDesignacion(0).build();
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetDesignacionDTO> obtenerPorEstado(int estado) {
        List<Designacion> designaciones = designacionRepository.findByEstadoDesignacion(estado);
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    public List<GetDesignadosDTO> obtenerArbitrosDesignados(Long idDesignacion) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return designados.stream().map(GetDesignadosDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void eliminarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        designadosRepository.deleteAllByDesignacion_IdDesignacion(idDesignacion);
        designacionRepository.delete(designacion);
    }

    @Override
    @Transactional
    public GetDesignacionDTO finalizarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));
        designacion.setEstadoDesignacion(2);
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetDesignacionDTO> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        List<Designacion> designaciones = designacionRepository.findByFechaBetween(inicio, fin);
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    public List<GetDesignacionDTO> obtenerPorFecha(LocalDate fecha) {
        LocalDateTime fechaParse = fecha.atStartOfDay();
        List<Designacion> designaciones = designacionRepository.findByFechaBetween(fechaParse, fecha.atTime(LocalTime.MAX));
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    @Transactional
    public GetDesignacionDTO actualizarDesignacion(Long idDesignacion, DesignacionDTO designacionDTO) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));
        designacion.setFecha(designacionDTO.getFecha());
        designacion.setCancha(buscarCancha(designacionDTO.getIdCancha()));
        designacion.setEtapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato()));
        designacion.setCantidadPartidos(designacionDTO.getCantidadPartidos());
        designacion.setEstadoDesignacion(1);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        if (designadosActualizados.size() < needed) {
            designacion.setEstadoDesignacion(0);
        }
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    @Transactional
    public GetDesignacionDTO designarListaArbitrosADesignacion(Long idDesignacion, List<Long> idsArbitros) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));
        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Long idArbitro : idsArbitros) {
            Arbitro arbitro = buscarArbitro(idArbitro);
            Designados designados = Designados.builder().arbitro(arbitro).designacion(designacion).montoPercibido(new BigDecimal("0.00")).categoriaArbitro(arbitro.getCategoria()).partidosDirigidos(0).build();
            designadosRepository.save(designados);
        }
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        if (designadosActualizados.size() >= needed) {
            designacion.setEstadoDesignacion(1);
            designacionRepository.save(designacion);
        }
        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    public GetDesignacionDTO cambiarEstadoDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        designacion.setEstadoDesignacion(3);
        designacionRepository.save(designacion);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    public GetDesignacionDTO aceptarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        designacion.setEstadoDesignacion(1);
        designacionRepository.save(designacion);
        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    public GetDesignacionDTO reprogramarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        designacion.setEstadoDesignacion(1);
        designacion.setFecha(designacion.getFecha().plusDays(7));
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetDesignacionDTO> obtenerPorMes(int mes, int anio) {
        List<Designacion> designaciones = designacionRepository.findByMesAndAnio(mes, anio);
        return cargarDesignadosPorLotes(designaciones);
    }

    @Override
    @Transactional
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

        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    @Transactional
    public GetDesignacionDTO asignarArbitroADesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));

        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new BadRequestException("La designación no tiene una cancha asignada.");
        }

        Arbitro arbitro = buscarArbitro(idArbitro);

        if (!esArbitroAptoParaEtapa(arbitro.getCategoria(), designacion.getEtapaCampeonato())) {
            throw new BadRequestException("No se puede asignar: la categoría del árbitro (" + arbitro.getCategoria() + ") no es apta para la etapa (" + designacion.getEtapaCampeonato() + ")");
        }

        if (tieneArbitroSuspencionActiva(arbitro, designacion.getFecha(), designacion.getCancha())) {
            throw new BadRequestException("No se puede asignar: el árbitro tiene una suspensión activa en la fecha de la designación");
        }


        // 1. Obtener la última vez que este árbitro fue designado antes de esta fecha
        Optional<Designados> ultimaDesignacionDelArbitro = designadosRepository.findFirstByArbitro_IdArbitroAndDesignacion_FechaBeforeOrderByDesignacion_FechaDesc(idArbitro, designacion.getFecha());

        if (ultimaDesignacionDelArbitro.isPresent()) {
            Cancha ultimaCancha = ultimaDesignacionDelArbitro.get().getDesignacion().getCancha();
            if (ultimaCancha != null && ultimaCancha.getIdCancha().equals(canchaId)) {
                throw new BadRequestException("No se puede asignar: el árbitro arbitró en esta misma cancha en su partido inmediatamente anterior.");
            }
        }
        ArancelArbitral arancelArbitral = arancelRepo.findByCantidadPartidosAndCancha_IdCanchaAndActivoTrue(designacion.getCantidadPartidos(), canchaId);
        Designados designados = new Designados();
        designados.setArbitro(arbitro);
        designados.setDesignacion(designacion);
        designados.setCategoriaArbitro(arbitro.getCategoria());
        designados.setPartidosDirigidos(0);
        if (arancelArbitral == null) {
            designados.setMontoPercibido(BigDecimal.ZERO);
        } else {
            BigDecimal cantidadPartidosBD = new BigDecimal(designacion.getCantidadPartidos());
            BigDecimal totalDeJornada = arancelArbitral.getMontoTotal();
            // 2. Corregimos la división: convertimos el divisor a BigDecimal
            BigDecimal arbitrosNecesariosBD = new BigDecimal(calcularArbitrosNecesarios(designacion.getCantidadPartidos()));
            totalDeJornada = totalDeJornada.divide(arbitrosNecesariosBD, RoundingMode.HALF_UP);
            designados.setMontoPercibido(totalDeJornada);
        }
        designadosRepository.save(designados);

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());

        if (designadosActualizados.size() >= needed && designacion.getEstadoDesignacion() == 0) {
            designacion.setEstadoDesignacion(1);
        }
        designacionRepository.save(designacion);

        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    @Override
    @Transactional
    public GetDesignacionDTO asignarArbitrosAutomaticamente(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new com.designaciones.webdesignaciones.utils.NotFoundException("Designacion no encontrada"));

        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new BadRequestException("La designación no tiene cancha asignada");
        }

        int totalNecesarios = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        int faltantes = totalNecesarios - designadosActuales.size();

        if (faltantes <= 0) {
            designacion.setEstadoDesignacion(1);
            designacionRepository.save(designacion);
            return new GetDesignacionDTO(designacion, designadosActuales);
        }

        List<Long> arbitrosPrevios = designadosRepository.findDistinctArbitroIdsByCanchaIdExcludingDesignacion(canchaId, idDesignacion);
        Set<Long> yaAsignadosIds = designadosActuales.stream().map(d -> d.getArbitro().getIdArbitro()).collect(Collectors.toSet());

        java.time.DayOfWeek dayOfWeek = designacion.getFecha().getDayOfWeek();
        List<Arbitro> activos;
        if (dayOfWeek == java.time.DayOfWeek.SATURDAY) {
            activos = arbitroRepository.findActivosDisponiblesParaSabado();
        } else if (dayOfWeek == java.time.DayOfWeek.SUNDAY) {
            activos = arbitroRepository.findActivosDisponiblesParaDomingo();
        } else {
            activos = arbitroRepository.findByEstadoSistemaTrue();
        }
        List<Arbitro> candidatosNoPrevio = new ArrayList<>();
        List<Arbitro> candidatosPrevio = new ArrayList<>();
        LocalDateTime fechaDesignacion = designacion.getFecha();
        EtapaCampeonato etapaActual = designacion.getEtapaCampeonato();

        for (Arbitro a : activos) {
            if (yaAsignadosIds.contains(a.getIdArbitro())) continue;

            if (!esArbitroAptoParaEtapa(a.getCategoria(), etapaActual)) continue;

            // Validar si el árbitro tiene una suspensión activa
            if (tieneArbitroSuspencionActiva(a, fechaDesignacion, designacion.getCancha())) continue;

            // Comparar por día (ignorar hora)
            Long asignacionesEnFecha = 0L;
            boolean esDomingoAuto = false;
            if (fechaDesignacion != null) {
                LocalDate fechaLocalAuto = fechaDesignacion.toLocalDate();
                LocalDateTime startAuto = fechaLocalAuto.atStartOfDay();
                LocalDateTime endAuto = fechaLocalAuto.atTime(LocalTime.MAX);
                asignacionesEnFecha = designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(a.getIdArbitro(), startAuto, endAuto, idDesignacion);
                // Si la fecha de designación es domingo, permitimos que un árbitro esté en varias canchas ese día
                esDomingoAuto = fechaLocalAuto.getDayOfWeek() == DayOfWeek.SUNDAY;
            }
            if (!esDomingoAuto && asignacionesEnFecha != null && asignacionesEnFecha > 0) continue;

            if (arbitrosPrevios.contains(a.getIdArbitro())) {
                candidatosPrevio.add(a);
            } else {
                candidatosNoPrevio.add(a);
            }
        }

        // ¡CLAVE! Mezclamos las listas para que la selección sea RANDOM
        Collections.shuffle(candidatosNoPrevio);
        Collections.shuffle(candidatosPrevio);

        List<Arbitro> seleccionar = new ArrayList<>();

        long previosYaAsignados = designadosActuales.stream().filter(d -> arbitrosPrevios.contains(d.getArbitro().getIdArbitro())).count();

        boolean esFechaNormal = (etapaActual == EtapaCampeonato.FECHA_NORMAL);
        boolean tieneIntermedio = designadosActuales.stream().anyMatch(d -> esIntermedioOSuperior(d.getArbitro().getCategoria()));

        // 1. FORZAR INTERMEDIO (Si es Fecha Normal y aún no hay ninguno asignado)
        if (esFechaNormal && !tieneIntermedio) {
            Optional<Arbitro> intermedioNoPrevio = candidatosNoPrevio.stream().filter(a -> esIntermedioOSuperior(a.getCategoria())).findFirst();

            if (intermedioNoPrevio.isPresent()) {
                Arbitro arb = intermedioNoPrevio.get();
                validarCategoryRecristriccionInicialFormacionArbitros(designacion, arb.getCategoria(), seleccionar);
                seleccionar.add(arb);
                candidatosNoPrevio.remove(arb);
                faltantes--;
            } else {
                // Si no hay en No Previos, buscamos en los Previos (solo si la cancha lo permite)
                if (previosYaAsignados == 0) {
                    Optional<Arbitro> intermedioPrevio = candidatosPrevio.stream().filter(a -> esIntermedioOSuperior(a.getCategoria())).findFirst();

                    if (intermedioPrevio.isPresent()) {
                        Arbitro arb = intermedioPrevio.get();
                        validarCategoryRecristriccionInicialFormacionArbitros(designacion, arb.getCategoria(), seleccionar);
                        seleccionar.add(arb);
                        candidatosPrevio.remove(arb);
                        faltantes--;
                        previosYaAsignados++;
                    } else {
                        throw new BadRequestException("Para una FECHA_NORMAL se requiere al menos un árbitro de categoría INTERMEDIO o superior, y no hay ninguno disponible.");
                    }
                } else {
                    throw new BadRequestException("Se requiere un árbitro INTERMEDIO, pero los únicos disponibles ya arbitraron en esta cancha y se alcanzó el límite permitido.");
                }
            }
        }

        // 2. RELLENAR LOS FALTANTES (Ya están mezclados de forma random)
        Iterator<Arbitro> itNoPrevio = candidatosNoPrevio.iterator();
        while (itNoPrevio.hasNext() && faltantes > 0) {
            Arbitro candidato = itNoPrevio.next();
            // Validar restricción de INICIAL y EN_FORMACION para FECHA_NORMAL antes de agregar
            validarCategoryRecristriccionInicialFormacionArbitros(designacion, candidato.getCategoria(), seleccionar);
            seleccionar.add(candidato);
            itNoPrevio.remove();
            faltantes--;
        }

        if (faltantes > 0 && previosYaAsignados == 0 && !candidatosPrevio.isEmpty()) {
            Arbitro candidato = candidatosPrevio.get(0);
            validarCategoryRecristriccionInicialFormacionArbitros(designacion, candidato.getCategoria(), seleccionar);
            seleccionar.add(candidato);
            faltantes--;
            previosYaAsignados++;
        }

        if (faltantes > 0) {
            throw new BadRequestException("No hay suficientes árbitros activos y con la categoría adecuada disponibles para asignar (faltan: " + faltantes + ").");
        }

        for (Arbitro a : seleccionar) {
            Designados d = Designados.builder().arbitro(a).designacion(designacion).montoPercibido(new BigDecimal("0.00")).categoriaArbitro(a.getCategoria()).partidosDirigidos(0).build();
            designadosRepository.save(d);
        }

        designacion.setEstadoDesignacion(1); // marcar como en proceso
        designacionRepository.save(designacion);

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return new GetDesignacionDTO(designacion, designadosActualizados);
    }

    private boolean tieneArbitroSuspencionActiva(Arbitro arbitro, LocalDateTime fechaDesignacion, Cancha cancha) {
        if (arbitro == null || fechaDesignacion == null || cancha == null) {
            return false;
        }

        // Como ya filtramos por cancha en el repositorio, no necesitamos verificarla de nuevo
        List<Suspencion> suspensiones = suspencionRepository.findByArbitroAndCancha(arbitro, cancha);
        LocalDate fecha = fechaDesignacion.toLocalDate();

        return suspensiones.stream().anyMatch(sus -> sus.getTipoSuspencion() == 2 && !fecha.isBefore(sus.getFechaIncidente().toLocalDate()) && !fecha.isAfter(sus.getFechaFin().toLocalDate()));
    }

    private boolean esArbitroAptoParaEtapa(CategoriaArbitro categoria, EtapaCampeonato etapa) {
        if (categoria == null || etapa == null) {
            return false;
        }

        switch (etapa) {
            case FINAL:
            case SEMIFINAL:
            case FECHA_PICANTE:
                return categoria == CategoriaArbitro.ELITE || categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.INTERMEDIO;

            case CRUCES:
            case CLASIFICACION:
                return categoria == CategoriaArbitro.ELITE || categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.INTERMEDIO || categoria == CategoriaArbitro.INTERMEDIO_BAJO;

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

    private boolean esIntermedioOSuperior(CategoriaArbitro categoria) {
        if (categoria == null) return false;

        return categoria == CategoriaArbitro.INTERMEDIO || categoria == CategoriaArbitro.AVANZADO || categoria == CategoriaArbitro.ELITE;
    }


    private void validarCategoryRecristriccionInicialFormacion(Designacion designacion, CategoriaArbitro
            categoriaAAsginar, List<Designados> designadosActuales) {
        // La restricción solo aplica a FECHA_NORMAL
        if (designacion.getEtapaCampeonato() != EtapaCampeonato.FECHA_NORMAL) {
            return;
        }

        // La restricción solo aplica si el árbitro a asignar es INICIAL o EN_FORMACION
        if (categoriaAAsginar != CategoriaArbitro.INICIAL && categoriaAAsginar != CategoriaArbitro.EN_FORMACION) {
            return;
        }

        // Contar árbitros INICIAL y EN_FORMACION ya asignados
        long cantidadInicial = designadosActuales.stream().filter(d -> d.getCategoriaArbitro() == CategoriaArbitro.INICIAL).count();

        long cantidadEnFormacion = designadosActuales.stream().filter(d -> d.getCategoriaArbitro() == CategoriaArbitro.EN_FORMACION).count();

        // Validaciones
        if (categoriaAAsginar == CategoriaArbitro.INICIAL) {
            // Si intenta asignar INICIAL
            if (cantidadEnFormacion > 0) {
                throw new BadRequestException("No se puede asignar un árbitro de categoría INICIAL a una designación que ya tiene un árbitro EN_FORMACION.");
            }
            if (cantidadInicial >= 1) {
                throw new BadRequestException("No se puede asignar más de 1 árbitro de categoría INICIAL a una designación en FECHA_NORMAL.");
            }
        } else {
            // El único otro caso válido es EN_FORMACION
            if (cantidadInicial > 0) {
                throw new BadRequestException("No se puede asignar un árbitro de categoría EN_FORMACION a una designación que ya tiene un árbitro INICIAL.");
            }
            if (cantidadEnFormacion >= 1) {
                throw new BadRequestException("No se puede asignar más de 1 árbitro de categoría EN_FORMACION a una designación en FECHA_NORMAL.");
            }
        }
    }


    private void validarCategoryRecristriccionInicialFormacionArbitros(Designacion designacion, CategoriaArbitro
            categoriaAAsginar, List<Arbitro> arbitrosSeleccionados) {
        if (designacion.getEtapaCampeonato() != EtapaCampeonato.FECHA_NORMAL) {
            return;
        }
        if (categoriaAAsginar != CategoriaArbitro.INICIAL && categoriaAAsginar != CategoriaArbitro.EN_FORMACION) {
            return;
        }

        long cantidadInicial = arbitrosSeleccionados.stream().filter(a -> a.getCategoria() == CategoriaArbitro.INICIAL).count();

        long cantidadEnFormacion = arbitrosSeleccionados.stream().filter(a -> a.getCategoria() == CategoriaArbitro.EN_FORMACION).count();

        // Validaciones
        if (categoriaAAsginar == CategoriaArbitro.INICIAL) {
            // Si intenta asignar INICIAL
            if (cantidadEnFormacion > 0) {
                throw new BadRequestException("No se puede asignar un árbitro de categoría INICIAL a una designación que ya tiene un árbitro EN_FORMACION.");
            }
            if (cantidadInicial >= 1) {
                throw new BadRequestException("No se puede asignar más de 1 árbitro de categoría INICIAL a una designación en FECHA_NORMAL.");
            }
        } else {
            // El único otro caso válido es EN_FORMACION
            if (cantidadInicial > 0) {
                throw new BadRequestException("No se puede asignar un árbitro de categoría EN_FORMACION a una designación que ya tiene un árbitro INICIAL.");
            }
            if (cantidadEnFormacion >= 1) {
                throw new BadRequestException("No se puede asignar más de 1 árbitro de categoría EN_FORMACION a una designación en FECHA_NORMAL.");
            }
        }
    }

    private List<GetDesignacionDTO> cargarDesignadosPorLotes(List<Designacion> designaciones) {
        if (designaciones.isEmpty()) return List.of();

        List<Long> ids = designaciones.stream().map(Designacion::getIdDesignacion).collect(Collectors.toList());

        Map<Long, List<Designados>> designadosPorDesignacion = designadosRepository.findByDesignacion_IdDesignacionIn(ids).stream().collect(Collectors.groupingBy(d -> d.getDesignacion().getIdDesignacion()));

        return designaciones.stream().map(des -> new GetDesignacionDTO(des, designadosPorDesignacion.getOrDefault(des.getIdDesignacion(), List.of()))).collect(Collectors.toList());
    }
}
