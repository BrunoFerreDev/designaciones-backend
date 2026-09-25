package com.designaciones.webdesignaciones.component;

import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DesignacionRuleEngine {

    private final DesignadosRepository designadosRepository;
    private final DesignacionRepository designacionRepository;
    private final SuspencionRepository suspencionRepository;

    public void validarAsignacion(Designacion designacion, Arbitro arbitro, List<Designados> designadosActuales, boolean forzarEtapa) {
        Long canchaId = designacion.getCancha() == null ? null : designacion.getCancha().getIdCancha();
        if (canchaId == null) {
            throw new BadRequestException("La designación no tiene una cancha asignada.");
        }

        if (!forzarEtapa && !esArbitroAptoParaEtapa(arbitro.getCategoria(), designacion.getEtapaCampeonato())) {
            throw new BadRequestException("No se puede asignar: la categoría del árbitro (" + arbitro.getCategoria() + ") no es apta para la etapa (" + designacion.getEtapaCampeonato() + ")");
        }

        if (tieneArbitroSuspencionActiva(arbitro, designacion.getFecha(), designacion.getCancha())) {
            throw new BadRequestException("No se puede asignar: el árbitro tiene una suspensión activa en la fecha de la designación");
        }

        boolean esHectorArbitro = esHector(arbitro);
        boolean necesitaViaje = Boolean.TRUE.equals(designacion.getCancha().getNecesitaViaje());

        boolean yaEstaAsignado = designadosActuales.stream()
                .anyMatch(d -> d.getArbitro() != null && Objects.equals(d.getArbitro().getIdArbitro(), arbitro.getIdArbitro()));
        if (yaEstaAsignado) {
            throw new BadRequestException("No se puede asignar: el árbitro ya se encuentra asignado a esta designación.");
        }

        if (designacion.getFecha() != null) {
            LocalDate fechaLocal = designacion.getFecha().toLocalDate();
            LocalDateTime start = fechaLocal.atStartOfDay();
            LocalDateTime end = fechaLocal.atTime(LocalTime.MAX);

            Long asignacionesEnFecha = designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(
                    arbitro.getIdArbitro(), start, end, designacion.getIdDesignacion());

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
                        .anyMatch(d -> d.getArbitro() != null && d.getArbitro().getIdArbitro().equals(arbitro.getIdArbitro()));

                if (arbitroEstuvoEnCanchaAnterior && !esHectorArbitro) {
                    throw new BadRequestException("No se puede asignar: el árbitro ya estuvo en esta cancha en la última fecha disputada en ella.");
                }
            }
        }
    }

    public boolean esArbitroAptoParaEtapa(CategoriaArbitro categoria, EtapaCampeonato etapa) {
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
                return true;

            default:
                return true;
        }
    }

    public boolean tieneArbitroSuspencionActiva(Arbitro arbitro, LocalDateTime fechaDesignacion, Cancha cancha) {
        if (arbitro == null || fechaDesignacion == null || cancha == null) {
            return false;
        }
        List<Suspencion> suspensiones = suspencionRepository.findByArbitroAndCancha(arbitro, cancha);
        LocalDate fecha = fechaDesignacion.toLocalDate();

        return suspensiones.stream().anyMatch(sus -> sus.getTipoSuspencion() == 2 && !fecha.isBefore(sus.getFechaIncidente().toLocalDate()) && !fecha.isAfter(sus.getFechaFin().toLocalDate()));
    }

    public boolean esHector(Arbitro a) {
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

    public boolean tieneVehiculoOEsHector(Arbitro a) {
        if (a == null) return false;
        return Boolean.TRUE.equals(a.getTieneAuto()) || esHector(a);
    }

    public int calcularArbitrosNecesarios(Integer cantidadPartidos) {
        if (cantidadPartidos == null || cantidadPartidos <= 4) {
            return 3;
        } else if (cantidadPartidos <= 6) {
            return 4;
        } else {
            return 4 + (cantidadPartidos - 5) / 2;
        }
    }
}
