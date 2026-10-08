package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.EstadoCuentaArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.get.GetPrestamoDTO;
import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.Suspencion;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasArbitroDetalleDTO;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.DeudaGastoRepository;
import com.designaciones.webdesignaciones.repository.PrestamoRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.service.ArbitroMeService;
import com.designaciones.webdesignaciones.service.DesignacionService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArbitroMeServiceImpl implements ArbitroMeService {

    private final ArbitroRepository arbitroRepository;
    private final DesignadosRepository designadosRepository;
    private final SuspencionRepository suspencionRepository;
    private final PrestamoRepository prestamoRepository;
    private final DeudaGastoRepository deudaGastoRepository;
    private final DesignacionService designacionService;

    private Arbitro getArbitroByWhatsapp(String whatsapp) {
        Arbitro arbitro = arbitroRepository.findByWhatsapp(whatsapp);
        if (arbitro == null) {
            throw new NotFoundException("Árbitro no encontrado con WhatsApp: " + whatsapp);
        }
        return arbitro;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetDesignacionDTO> getMisDesignaciones(String whatsapp, int page, int size) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);
        return designadosRepository.findByArbitro(arbitro, PageRequest.of(page, size))
                .map(d -> new GetDesignacionDTO(d.getDesignacion()));
    }

    @Override
    @Transactional(readOnly = true)
    public ArbitroDisponibilidadDTO getMiDisponibilidad(String whatsapp) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);
        return new ArbitroDisponibilidadDTO(
                arbitro.getEstadoSistema(),
                arbitro.getDisponibleSabado(),
                arbitro.getDisponibleDomingo()
        );
    }

    @Override
    @Transactional
    public GetArbitroDTO updateMiDisponibilidad(String whatsapp, ArbitroDisponibilidadDTO dto) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);
        if (dto.getEstado() != null) {
            arbitro.setEstadoSistema(dto.getEstado());
        }
        if (dto.getDisponibleSabado() != null) {
            arbitro.setDisponibleSabado(dto.getDisponibleSabado());
        }
        if (dto.getDisponibleDomingo() != null) {
            arbitro.setDisponibleDomingo(dto.getDisponibleDomingo());
        }
        Arbitro saved = arbitroRepository.save(arbitro);
        return new GetArbitroDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetSuspencionDTO> getMisSuspenciones(String whatsapp, int page, int size) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);
        Page<Suspencion> pagina = suspencionRepository.findByArbitro(arbitro, PageRequest.of(page, size));
        return pagina.map(GetSuspencionDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public EstadoCuentaArbitroDTO getMiEstadoCuenta(String whatsapp) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);

        List<Prestamo> prestamos = prestamoRepository.findByArbitro(arbitro);
        List<Prestamo> pendientes = prestamos.stream()
                .filter(p -> !"PAGADO".equalsIgnoreCase(p.getEstado()))
                .toList();

        BigDecimal totalDeudaPrestamos = pendientes.stream()
                .map(p -> {
                    BigDecimal solicitado = p.getMontoSolicitado() != null ? p.getMontoSolicitado() : BigDecimal.ZERO;
                    BigDecimal devuelto = p.getMontoDevuelto() != null ? p.getMontoDevuelto() : BigDecimal.ZERO;
                    return solicitado.subtract(devuelto);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<GetPrestamoDTO> prestamosPendientesDTO = pendientes.stream()
                .map(GetPrestamoDTO::new)
                .toList();

        List<DeudaGasto> deudasGasto = deudaGastoRepository.findByArbitro(arbitro);
        BigDecimal totalGastosRecupero = deudasGasto.stream()
                .filter(d -> !"PAGADO".equalsIgnoreCase(d.getEstado()))
                .map(d -> {
                    BigDecimal asignado = d.getMontoAsignado() != null ? d.getMontoAsignado() : BigDecimal.ZERO;
                    BigDecimal pagado = d.getMontoPagado() != null ? d.getMontoPagado() : BigDecimal.ZERO;
                    return asignado.subtract(pagado);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EstadoCuentaArbitroDTO(
                arbitro.getIdArbitro(),
                arbitro.getNombreCompleto(),
                totalDeudaPrestamos,
                pendientes.size(),
                prestamosPendientesDTO,
                totalGastosRecupero
        );
    }

    @Override
    @Transactional(readOnly = true)
    public GetEstadisticasArbitroDetalleDTO getMisEstadisticas(String whatsapp, LocalDate inicio, LocalDate fin, String orden, int page, int size) {
        Arbitro arbitro = getArbitroByWhatsapp(whatsapp);
        LocalDate fechaInicio = inicio != null ? inicio : LocalDate.now().withDayOfMonth(1);
        LocalDate fechaFin = fin != null ? fin : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        LocalDateTime start = fechaInicio.atStartOfDay();
        LocalDateTime end = fechaFin.atTime(LocalTime.MAX);
        return designacionService.obtenerEstadisticasArbitro(arbitro.getIdArbitro(), start, end, orden, page, size);
    }
}
