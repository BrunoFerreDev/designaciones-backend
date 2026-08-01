package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.utils.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.designaciones.webdesignaciones.event.ArbitroDisponibleEvent;
import com.designaciones.webdesignaciones.event.ArbitroNoDisponibleEvent;
import com.designaciones.webdesignaciones.notification.NotificationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArbitroServiceImpl implements ArbitroService {
    private final ArbitroRepository arbitroRepository;
    private final DesignadosRepository designadosRepository;
    private final DesignacionRepository designacionRepository;
    private final SuspencionRepository suspencionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public GetArbitroDTO createArbitro(ArbitroDTO arbitroDTO) {
        Arbitro arbitro = Arbitro.builder()
                .nombre(arbitroDTO.getNombre())
                .apellido(arbitroDTO.getApellido())
                .whatsapp(arbitroDTO.getWhatsapp())
                .categoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()))
                .talleShort(arbitroDTO.getTalleShort())
                .contrasenia(passwordEncoder.encode(arbitroDTO.getApellido() + arbitroDTO.getNombre()))
                .talleCamiseta(arbitroDTO.getTalleCamiseta())
                .disponibleSabado(arbitroDTO.getDisponibleSabado() != null ? arbitroDTO.getDisponibleSabado() : false)
                .disponibleDomingo(arbitroDTO.getDisponibleDomingo() != null ? arbitroDTO.getDisponibleDomingo() : false)
                .tieneAuto(arbitroDTO.getTieneAuto() != null ? arbitroDTO.getTieneAuto() : false)
                .estadoSistema(true)
                .build();
        arbitroRepository.save(arbitro);

        if (Boolean.TRUE.equals(arbitro.getDisponibleSabado()) || Boolean.TRUE.equals(arbitro.getDisponibleDomingo())) {
            eventPublisher.publishEvent(new ArbitroDisponibleEvent(this, arbitro.getIdArbitro(), arbitro.getDisponibleSabado(), arbitro.getDisponibleDomingo()));
        }

        return new GetArbitroDTO(arbitro, tieneSuspencion(arbitro.getIdArbitro(), LocalDateTime.now()),ultimaDesignacion(arbitro));
    }

    @Override
    public Page<GetArbitroDTO> getAllArbitros(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findAll(pageable).map(a -> new GetArbitroDTO(a, tieneSuspencion(a.getIdArbitro(), LocalDateTime.now()), ultimaDesignacion(a)));
    }

    @Override
    public Page<GetArbitroDTO> traerDisponibles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findByDisponibleSabadoTrueAndDisponibleDomingoTrue(pageable).map(a -> new GetArbitroDTO(a, tieneSuspencion(a.getIdArbitro(), LocalDateTime.now()),ultimaDesignacion(a)));
        /*return arbitroRepository.findByDisponibilidadTrueAndEstadoSistemaTrue(pageable).map(GetArbitroDTO::new);*/
    }

    @Override
    @Transactional
    public GetArbitroDTO updateArbitroDisponibilidad(Long idArbitro, ArbitroDisponibilidadDTO dto) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));

        boolean sabadoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleSabado()) && Boolean.FALSE.equals(dto.getDisponibleSabado());
        boolean domingoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleDomingo()) && Boolean.FALSE.equals(dto.getDisponibleDomingo());

        boolean nuevoSabadoDisponible = Boolean.TRUE.equals(dto.getDisponibleSabado()) && !Boolean.TRUE.equals(arbitro.getDisponibleSabado());
        boolean nuevoDomingoDisponible = Boolean.TRUE.equals(dto.getDisponibleDomingo()) && !Boolean.TRUE.equals(arbitro.getDisponibleDomingo());

        if (dto.getDisponibleSabado() != null) arbitro.setDisponibleSabado(dto.getDisponibleSabado());
        if (dto.getDisponibleDomingo() != null) arbitro.setDisponibleDomingo(dto.getDisponibleDomingo());
        arbitroRepository.save(arbitro);

        if (sabadoChangedToNoDisponible || domingoChangedToNoDisponible) {
            eventPublisher.publishEvent(new ArbitroNoDisponibleEvent(this, arbitro.getIdArbitro(), sabadoChangedToNoDisponible, domingoChangedToNoDisponible));
        }

        if (nuevoSabadoDisponible || nuevoDomingoDisponible || Boolean.TRUE.equals(arbitro.getDisponibleSabado()) || Boolean.TRUE.equals(arbitro.getDisponibleDomingo())) {
            eventPublisher.publishEvent(new ArbitroDisponibleEvent(this, arbitro.getIdArbitro(), arbitro.getDisponibleSabado(), arbitro.getDisponibleDomingo()));
        }

        return new GetArbitroDTO(arbitro, tieneSuspencion(arbitro.getIdArbitro(), LocalDateTime.now()), ultimaDesignacion(arbitro));
    }

    @Override
    @Transactional
    public GetArbitroDTO updateArbitro(Long idArbitro, ArbitroDTO arbitroDTO) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));

        boolean sabadoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleSabado()) && Boolean.FALSE.equals(arbitroDTO.getDisponibleSabado());
        boolean domingoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleDomingo()) && Boolean.FALSE.equals(arbitroDTO.getDisponibleDomingo());

        if (arbitroDTO.getNombre() != null) arbitro.setNombre(arbitroDTO.getNombre());
        if (arbitroDTO.getApellido() != null) arbitro.setApellido(arbitroDTO.getApellido());
        if (arbitroDTO.getWhatsapp() != null) arbitro.setWhatsapp(arbitroDTO.getWhatsapp());
        if (arbitroDTO.getCategoria() != null)
            arbitro.setCategoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()));
        if (arbitroDTO.getDisponibleSabado() != null) arbitro.setDisponibleSabado(arbitroDTO.getDisponibleSabado());
        if (arbitroDTO.getDisponibleDomingo() != null) arbitro.setDisponibleDomingo(arbitroDTO.getDisponibleDomingo());
        if (arbitroDTO.getTalleShort() != null) arbitro.setTalleShort(arbitroDTO.getTalleShort());
        if (arbitroDTO.getTalleCamiseta() != null) arbitro.setTalleCamiseta(arbitroDTO.getTalleCamiseta());
        if (arbitroDTO.getTieneAuto() != null) arbitro.setTieneAuto(arbitroDTO.getTieneAuto());
        arbitroRepository.save(arbitro);

        if (sabadoChangedToNoDisponible || domingoChangedToNoDisponible) {
            eventPublisher.publishEvent(new ArbitroNoDisponibleEvent(this, arbitro.getIdArbitro(), sabadoChangedToNoDisponible, domingoChangedToNoDisponible));
        }

        if (Boolean.TRUE.equals(arbitro.getDisponibleSabado()) || Boolean.TRUE.equals(arbitro.getDisponibleDomingo())) {
            eventPublisher.publishEvent(new ArbitroDisponibleEvent(this, arbitro.getIdArbitro(), arbitro.getDisponibleSabado(), arbitro.getDisponibleDomingo()));
        }

        return new GetArbitroDTO(arbitro, tieneSuspencion(arbitro.getIdArbitro(), LocalDateTime.now()),ultimaDesignacion(arbitro));
    }

    @Override
    @Transactional
    public String deleteArbitro(Long idArbitro) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));

        boolean sabadoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleSabado());
        boolean domingoChangedToNoDisponible = Boolean.TRUE.equals(arbitro.getDisponibleDomingo());

        arbitro.setEstadoSistema(false);
        arbitro.setDisponibleSabado(false);
        arbitro.setDisponibleDomingo(false);
        arbitroRepository.save(arbitro);

        if (sabadoChangedToNoDisponible || domingoChangedToNoDisponible) {
            eventPublisher.publishEvent(new ArbitroNoDisponibleEvent(this, arbitro.getIdArbitro(), sabadoChangedToNoDisponible, domingoChangedToNoDisponible));
        }

        return "Arbitro con id " + idArbitro + " eliminado correctamente";
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

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void eliminarDesignacionesPorFaltaDeDisponibilidadAsync(Long idArbitro, boolean sabadoNoDisponible, boolean domingoNoDisponible) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElse(null);
        if (arbitro == null) return;
        eliminarDesignacionesPorFaltaDeDisponibilidad(arbitro, sabadoNoDisponible, domingoNoDisponible);
    }

    private void eliminarDesignacionesPorFaltaDeDisponibilidad(Arbitro arbitro, boolean sabadoNoDisponible, boolean domingoNoDisponible) {
        List<Designados> designadosList = designadosRepository.findByArbitro_IdArbitro(arbitro.getIdArbitro());
        LocalDate hoy = LocalDate.now();
        for (Designados designado : designadosList) {
            Designacion designacion = designado.getDesignacion();
            if (designacion == null) continue;

            int estado = designacion.getEstadoDesignacion();
            if (estado != 0 && estado != 1) {
                continue;
            }

            LocalDateTime fecha = designacion.getFecha();
            if (fecha == null) continue;

            if (fecha.toLocalDate().isBefore(hoy)) {
                continue;
            }

            DayOfWeek day = fecha.getDayOfWeek();
            boolean eliminar = (day == DayOfWeek.SATURDAY && sabadoNoDisponible) ||
                    (day == DayOfWeek.SUNDAY && domingoNoDisponible);

            if (eliminar) {
                designadosRepository.delete(designado);

                // Recalcular estado de la designacion
                List<Designados> remaining = designadosRepository.findByDesignacion_IdDesignacion(designacion.getIdDesignacion());
                long count = remaining.stream()
                        .filter(d -> !d.getIdDesignados().equals(designado.getIdDesignados()))
                        .count();
                int needed = calcularArbitrosNecesarios(designacion.getCantidadPartidos());
                if (count < needed && designacion.getEstadoDesignacion() == 1) {
                    designacion.setEstadoDesignacion(0);
                    designacionRepository.save(designacion);
                }

                String detalleCancha = (designacion.getCancha() != null && designacion.getCancha().getNombreCancha() != null)
                        ? designacion.getCancha().getNombreCancha()
                        : "la designación #" + designacion.getIdDesignacion();
                String nombreCompleto = arbitro.getNombre() + " " + arbitro.getApellido();
                notificationService.notificarDesasignacion(nombreCompleto, detalleCancha);
            }
        }
    }


    @Override
    @Transactional
    public String modificarDisponibilidadTotal() {
        arbitroRepository.resetearDisponibilidadDeTodos();
        return "Disponibilidad de todos los arbitros actualizada a false";
    }

    @Override
    public Page<GetArbitroDTO> traerTodos(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("apellido").ascending());
        return arbitroRepository.findAll(pageable).map(a -> new GetArbitroDTO(a, tieneSuspencion(a.getIdArbitro(), LocalDateTime.now()),ultimaDesignacion(a)));
    }

    @Override
    public Page<GetArbitroDTO> getNoDisponibles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findByDisponibleSabadoFalseOrDisponibleDomingoFalse(pageable).map(a -> new GetArbitroDTO(a, tieneSuspencion(a.getIdArbitro(), LocalDateTime.now()),ultimaDesignacion(a)));
    }

    @Override
    public Page<GetDesignacionDTO> traerDesignacionesPorArbitro(Long idArbitro, int page, int size) {
        /*// 1. Validar si el árbitro existe
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Árbitro no encontrado"));

        Pageable pageable = PageRequest.of(page, size);

        // 2. Paginar directamente desde el repositorio (Debes compilar este método en tu repositorio)
        Page<Designados> designadosPage = designadosRepository.findByArbitro(arbitro, pageable);

        // 3. Mapear cada elemento de la página al formato que necesitas
        return designadosPage.map(designado -> {
            Map<String, Object> dtoRespuesta = new HashMap<>();
            dtoRespuesta.put("Arbitro", new GetArbitroDTO(arbitro));
            dtoRespuesta.put("Designacion", new GetDesignacionDTO(designado.getDesignacion()));
            return dtoRespuesta;
        });*/
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
        Pageable pageable = PageRequest.of(page, size);
        Page<Designados> designadosPage = designadosRepository.findByArbitro(arbitro, pageable);
        return designadosPage.map(designado -> new GetDesignacionDTO(designado.getDesignacion()));
    }

    private Boolean tieneSuspencion(Long idArbitro, LocalDateTime fecha) {
        return suspencionRepository.existePorArbitro(idArbitro, fecha);
    }

    private Long ultimaDesignacion(Arbitro arbitro) {
        return designadosRepository.findFirstByArbitroOrderByDesignacionFechaDesc(arbitro).getDesignacion().getIdDesignacion();
    }
}
