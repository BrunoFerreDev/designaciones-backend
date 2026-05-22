package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.DesignacionDTO;
import com.designaciones.webdesignaciones.dto.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.GetDesignadosDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesignacionServiceImpl implements DesignacionService {

    private final DesignacionRepository designacionRepository;
    private final CanchaRepository canchaRepository;
    private final ArbitroRepository arbitroRepository;
    private final DesignadosRepository designadosRepository;

    @Override
    public GetDesignacionDTO crearDesignacion(DesignacionDTO designacionDTO) {
        Designacion designacion = Designacion.builder()
                .fecha(designacionDTO.getFecha())
                .cancha(buscarCancha(designacionDTO.getIdCancha()))
                .etapaCampeonato(EtapaCampeonato.fromString(designacionDTO.getEtapaCampeonato()))
                .cantidadPartidos(designacionDTO.getCantidadPartidos())
                .estadoDesignacion(0)
                .build();
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetDesignacionDTO> obtenerPorEstado(int estado) {
        List<Designacion> designaciones = designacionRepository.findByEstadoDesignacion(estado);
        return designaciones.stream()
                .map(des -> {
                    List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(des.getIdDesignacion());
                    return new GetDesignacionDTO(des, designados);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<GetDesignadosDTO> obtenerArbitrosDesignados(Long idDesignacion) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return designados.stream()
                .map(GetDesignadosDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public void eliminarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new RuntimeException("Designacion no encontrada"));
        designadosRepository.deleteAll(designadosRepository.findByDesignacion_IdDesignacion(idDesignacion));
        designacionRepository.delete(designacion);
    }

    @Override
    public GetDesignacionDTO finalizarDesignacion(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new RuntimeException("Designacion no encontrada"));
        designacion.setEstadoDesignacion(2);
        designacionRepository.save(designacion);
        return new GetDesignacionDTO(designacion);
    }

    @Override
    public List<GetDesignacionDTO> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        return designacionRepository.findByFechaBetween(inicio, fin).stream()
                .map(GetDesignacionDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<GetDesignacionDTO> obtenerPorFecha(LocalDate fecha) {
        LocalDateTime fechaParse = fecha.atStartOfDay();
        return designacionRepository.findByFechaBetween(fechaParse, fecha.atTime(LocalTime.MAX)).stream()
                .map(GetDesignacionDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public GetDesignacionDTO quitarArbitroDeDesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new RuntimeException("Designacion no encontrada"));
        List<Designados> designado = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        Designados aEliminar = designado.stream()
                .filter(d -> Objects.equals(d.getArbitro().getIdArbitro(), idArbitro))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El árbitro no está asignado a esta designación"));
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
    public GetDesignacionDTO asignarArbitroADesignacion(Long idDesignacion, Long idArbitro) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new RuntimeException("Designacion no encontrada"));

        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new RuntimeException("La designación no tiene cancha asignada");
        }

        Arbitro arbitro = buscarArbitro(idArbitro);
        if (!esArbitroAptoParaEtapa(arbitro.getCategoria(), designacion.getEtapaCampeonato())) {
            throw new RuntimeException("No se puede asignar: la categoría del árbitro (" + arbitro.getCategoria() + ") no es apta para la etapa (" + designacion.getEtapaCampeonato() + ")");
        }

        List<Long> arbitrosPrevios = designadosRepository.findDistinctArbitroIdsByCanchaIdExcludingDesignacion(canchaId, idDesignacion);
        List<Designados> designadosActuales = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);

        // Prevenir asignación duplicada del mismo árbitro dentro de la misma designación
        boolean yaAsignado = designadosActuales.stream().anyMatch(d -> Objects.equals(d.getArbitro().getIdArbitro(), idArbitro));
        if (yaAsignado) {
            throw new RuntimeException("El árbitro ya está asignado a esta designación");
        }

        // Prevenir asignación del árbitro si ya está asignado en otra cancha en la misma fecha
        Long asignacionesEnFecha = designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(idArbitro, designacion.getFecha(), idDesignacion);
        if (asignacionesEnFecha != null && asignacionesEnFecha > 0) {
            throw new RuntimeException("No se puede asignar: el árbitro ya está asignado en otra cancha en la misma fecha");
        }

        // Validar restricción de INICIAL y EN_FORMACION para FECHA_NORMAL
        validarCategoryRecristriccionInicialFormacion(designacion, arbitro.getCategoria(), designadosActuales);

        // Contar cuántos de los designados actuales pertenecen al grupo de árbitros previos de la cancha
        long existentesPreviosEnActual = designadosActuales.stream()
                .filter(d -> arbitrosPrevios.contains(d.getArbitro().getIdArbitro()))
                .count();

        boolean candidatoEsPrevio = arbitrosPrevios.contains(idArbitro);
        if (candidatoEsPrevio && existentesPreviosEnActual >= 1) {
            throw new RuntimeException("No se puede asignar: ya hay un árbitro que previamente estuvo en la misma cancha. Solo se permite uno.");
        }

        Designados designados = Designados.builder()
                .arbitro(arbitro)
                .designacion(designacion)
                .montoPercibido(new BigDecimal("0.00"))
                .categoriaArbitro(arbitro.getCategoria()) // Sugerencia: guardar categoría al asignar manualmente también
                .partidosDirigidos(0)
                .build();
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
    public GetDesignacionDTO asignarArbitrosAutomaticamente(Long idDesignacion) {
        Designacion designacion = designacionRepository.findById(idDesignacion)
                .orElseThrow(() -> new RuntimeException("Designacion no encontrada"));

        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new RuntimeException("La designación no tiene cancha asignada");
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

        List<Arbitro> activos = arbitroRepository.findByDisponibilidadTrueAndEstadoSistemaTrue();
        List<Arbitro> candidatosNoPrevio = new ArrayList<>();
        List<Arbitro> candidatosPrevio = new ArrayList<>();
        LocalDateTime fechaDesignacion = designacion.getFecha();
        EtapaCampeonato etapaActual = designacion.getEtapaCampeonato();

        for (Arbitro a : activos) {
            if (yaAsignadosIds.contains(a.getIdArbitro())) continue;

            if (!esArbitroAptoParaEtapa(a.getCategoria(), etapaActual)) continue;

            Long asignacionesEnFecha = designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(a.getIdArbitro(), fechaDesignacion, idDesignacion);
            if (asignacionesEnFecha != null && asignacionesEnFecha > 0) continue;

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

        long previosYaAsignados = designadosActuales.stream()
                .filter(d -> arbitrosPrevios.contains(d.getArbitro().getIdArbitro()))
                .count();

        boolean esFechaNormal = (etapaActual == EtapaCampeonato.FECHA_NORMAL);
        boolean tieneIntermedio = designadosActuales.stream()
                .anyMatch(d -> esIntermedioOSuperior(d.getArbitro().getCategoria()));

        // 1. FORZAR INTERMEDIO (Si es Fecha Normal y aún no hay ninguno asignado)
        if (esFechaNormal && !tieneIntermedio) {
            Optional<Arbitro> intermedioNoPrevio = candidatosNoPrevio.stream()
                    .filter(a -> esIntermedioOSuperior(a.getCategoria()))
                    .findFirst();

            if (intermedioNoPrevio.isPresent()) {
                Arbitro arb = intermedioNoPrevio.get();
                validarCategoryRecristriccionInicialFormacionArbitros(designacion, arb.getCategoria(), seleccionar);
                seleccionar.add(arb);
                candidatosNoPrevio.remove(arb);
                faltantes--;
            } else {
                // Si no hay en No Previos, buscamos en los Previos (solo si la cancha lo permite)
                if (previosYaAsignados == 0) {
                    Optional<Arbitro> intermedioPrevio = candidatosPrevio.stream()
                            .filter(a -> esIntermedioOSuperior(a.getCategoria()))
                            .findFirst();

                    if (intermedioPrevio.isPresent()) {
                        Arbitro arb = intermedioPrevio.get();
                        validarCategoryRecristriccionInicialFormacionArbitros(designacion, arb.getCategoria(), seleccionar);
                        seleccionar.add(arb);
                        candidatosPrevio.remove(arb);
                        faltantes--;
                        previosYaAsignados++;
                    } else {
                        throw new RuntimeException("Para una FECHA_NORMAL se requiere al menos un árbitro de categoría INTERMEDIO o superior, y no hay ninguno disponible.");
                    }
                } else {
                    throw new RuntimeException("Se requiere un árbitro INTERMEDIO, pero los únicos disponibles ya arbitraron en esta cancha y se alcanzó el límite permitido.");
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

        // 3. RELLENAR CON PREVIOS SI AÚN FALTAN (Respetando el límite de 1 previo por designación)
        if (faltantes > 0 && previosYaAsignados == 0 && !candidatosPrevio.isEmpty()) {
            Arbitro candidato = candidatosPrevio.get(0);
            // Validar restricción de INICIAL y EN_FORMACION para FECHA_NORMAL antes de agregar
            validarCategoryRecristriccionInicialFormacionArbitros(designacion, candidato.getCategoria(), seleccionar);
            seleccionar.add(candidato);
            faltantes--;
            previosYaAsignados++;
        }

        // 4. VERIFICACIÓN FINAL
        if (faltantes > 0) {
            throw new RuntimeException("No hay suficientes árbitros activos y con la categoría adecuada disponibles para asignar (faltan: " + faltantes + ").");
        }

        // 5. GUARDAR ASIGNACIONES
        for (Arbitro a : seleccionar) {
            Designados d = Designados.builder()
                    .arbitro(a)
                    .designacion(designacion)
                    .montoPercibido(new BigDecimal("0.00"))
                    .categoriaArbitro(a.getCategoria())
                    .partidosDirigidos(0)
                    .build();
            designadosRepository.save(d);
        }

        designacion.setEstadoDesignacion(1); // marcar como en proceso
        designacionRepository.save(designacion);

        List<Designados> designadosActualizados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return new GetDesignacionDTO(designacion, designadosActualizados);
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
                return categoria == CategoriaArbitro.ELITE ||
                        categoria == CategoriaArbitro.AVANZADO ||
                        categoria == CategoriaArbitro.INTERMEDIO ||
                        categoria == CategoriaArbitro.INTERMEDIO_BAJO;

            case FECHA_NORMAL:
                // CORRECCIÓN: Ahora retorna 'true'. Permitimos que el pool de candidatos
                // incluya a todos. La lógica de exigir 1 intermedio se maneja en el asignador.
                return true;

            default:
                return true;
        }
    }

    private Cancha buscarCancha(Long idCancha) {
        return canchaRepository.findById(idCancha).orElseThrow(() -> new RuntimeException("Cancha no encontrada"));
    }

    private Arbitro buscarArbitro(Long idArbitro) {
        return arbitroRepository.findById(idArbitro).orElseThrow(() -> new RuntimeException("Arbitro no encontrado"));
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

        return categoria == CategoriaArbitro.INTERMEDIO ||
                categoria == CategoriaArbitro.AVANZADO ||
                categoria == CategoriaArbitro.ELITE;
    }


    private void validarCategoryRecristriccionInicialFormacion(Designacion designacion,
                                                               CategoriaArbitro categoriaAAsginar,
                                                               List<Designados> designadosActuales) {
        // La restricción solo aplica a FECHA_NORMAL
        if (designacion.getEtapaCampeonato() != EtapaCampeonato.FECHA_NORMAL) {
            return;
        }

        // La restricción solo aplica si el árbitro a asignar es INICIAL o EN_FORMACION
        if (categoriaAAsginar != CategoriaArbitro.INICIAL && categoriaAAsginar != CategoriaArbitro.EN_FORMACION) {
            return;
        }

        // Contar árbitros INICIAL y EN_FORMACION ya asignados
        long cantidadInicial = designadosActuales.stream()
                .filter(d -> d.getCategoriaArbitro() == CategoriaArbitro.INICIAL)
                .count();

        long cantidadEnFormacion = designadosActuales.stream()
                .filter(d -> d.getCategoriaArbitro() == CategoriaArbitro.EN_FORMACION)
                .count();

        // Validaciones
        if (categoriaAAsginar == CategoriaArbitro.INICIAL) {
            // Si intenta asignar INICIAL
            if (cantidadEnFormacion > 0) {
                throw new RuntimeException("No se puede asignar un árbitro de categoría INICIAL a una designación que ya tiene un árbitro EN_FORMACION.");
            }
            if (cantidadInicial >= 1) {
                throw new RuntimeException("No se puede asignar más de 1 árbitro de categoría INICIAL a una designación en FECHA_NORMAL.");
            }
        } else {
            // El único otro caso válido es EN_FORMACION
            if (cantidadInicial > 0) {
                throw new RuntimeException("No se puede asignar un árbitro de categoría EN_FORMACION a una designación que ya tiene un árbitro INICIAL.");
            }
            if (cantidadEnFormacion >= 1) {
                throw new RuntimeException("No se puede asignar más de 1 árbitro de categoría EN_FORMACION a una designación en FECHA_NORMAL.");
            }
        }
    }


    private void validarCategoryRecristriccionInicialFormacionArbitros(Designacion designacion,
                                                                       CategoriaArbitro categoriaAAsginar,
                                                                       List<Arbitro> arbitrosSeleccionados) {
        if (designacion.getEtapaCampeonato() != EtapaCampeonato.FECHA_NORMAL) {
            return;
        }
        if (categoriaAAsginar != CategoriaArbitro.INICIAL && categoriaAAsginar != CategoriaArbitro.EN_FORMACION) {
            return;
        }

        long cantidadInicial = arbitrosSeleccionados.stream()
                .filter(a -> a.getCategoria() == CategoriaArbitro.INICIAL)
                .count();

        long cantidadEnFormacion = arbitrosSeleccionados.stream()
                .filter(a -> a.getCategoria() == CategoriaArbitro.EN_FORMACION)
                .count();

        // Validaciones
        if (categoriaAAsginar == CategoriaArbitro.INICIAL) {
            // Si intenta asignar INICIAL
            if (cantidadEnFormacion > 0) {
                throw new RuntimeException("No se puede asignar un árbitro de categoría INICIAL a una designación que ya tiene un árbitro EN_FORMACION.");
            }
            if (cantidadInicial >= 1) {
                throw new RuntimeException("No se puede asignar más de 1 árbitro de categoría INICIAL a una designación en FECHA_NORMAL.");
            }
        } else {
            // El único otro caso válido es EN_FORMACION
            if (cantidadInicial > 0) {
                throw new RuntimeException("No se puede asignar un árbitro de categoría EN_FORMACION a una designación que ya tiene un árbitro INICIAL.");
            }
            if (cantidadEnFormacion >= 1) {
                throw new RuntimeException("No se puede asignar más de 1 árbitro de categoría EN_FORMACION a una designación en FECHA_NORMAL.");
            }
        }
    }
}
