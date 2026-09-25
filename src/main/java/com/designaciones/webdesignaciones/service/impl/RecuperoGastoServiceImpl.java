package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDetalleTransaccionGastoDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Caja;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CajaRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.DeudaGastoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionGastoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionRecuperoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionRepository;
import com.designaciones.webdesignaciones.service.RecuperoGastoService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Primary
@Service
@RequiredArgsConstructor
public class RecuperoGastoServiceImpl implements RecuperoGastoService {

    private final TransaccionRepository transactionRepository;
    private final TransaccionGastoRepository transaccionGastoRepository;
    private final TransaccionRecuperoRepository transaccionRecuperoRepository;
    private final DeudaGastoRepository deudaGastoRepository;
    private final ArbitroRepository arbitroRepository;
    private final CajaRepository cajaRepository;
    private final DesignacionRepository designacionRepository;
    private final DesignadosRepository designadosRepository;

    private Arbitro getArbitroById(Long arbitroId) {
        return arbitroRepository.findById(arbitroId)
                .orElseThrow(() -> new NotFoundException("Árbitro no encontrado con ID: " + arbitroId));
    }

    @Override
    @Transactional
    public String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado) {
        TransaccionGasto gasto = transactionRepository.findById(idGasto)
                .filter(t -> t instanceof TransaccionGasto)
                .map(t -> (TransaccionGasto) t)
                .orElseThrow(() -> new BadRequestException("Gasto no encontrado con ID: " + idGasto));
        Arbitro arbitro = getArbitroById(idArbitro);
        if (deudaGastoRepository.existsByGastoOriginalAndArbitro(gasto, arbitro)) {
            throw new BadRequestException("Este gasto ya está asociado a este árbitro.");
        }
        DeudaGasto deudaGasto = new DeudaGasto();
        deudaGasto.setArbitro(arbitro);
        deudaGasto.setGastoOriginal(gasto);
        deudaGasto.setEstado("PENDIENTE");
        deudaGasto.setMontoAsignado(montoAsignado);
        deudaGasto.setMontoPagado(new BigDecimal("0.00"));
        gasto.addDeuda(deudaGasto);
        deudaGastoRepository.save(deudaGasto);
        transactionRepository.save(gasto);
        return "Gasto asociado correctamente al árbitro: " + arbitro.getApellido() + " " + arbitro.getNombre();
    }

    @Override
    @Transactional
    public String asignarArbitrosAGasto(Long idGasto, BigDecimal montoAasignar) {
        TransaccionGasto gasto = (TransaccionGasto) transactionRepository.findById(idGasto)
                .orElseThrow(() -> new BadRequestException("Gasto no encotrado con ID: " + idGasto));
        if (!gasto.getRequiereRecupero()) {
            throw new BadRequestException("El gasto no requiere recupero, no se pueden asignar árbitros");
        }
        List<Designacion> ultimas = designacionRepository.findByFechaBetween(
                gasto.getFechaTransaccion().atStartOfDay(),
                gasto.getFechaTransaccion().plusDays(7).atTime(23, 59, 59)
        );
        if (ultimas.isEmpty()) {
            throw new BadRequestException("No se encontraron designaciones en el rango de fechas para asignar árbitros al gasto");
        }
        List<Arbitro> arbitrosDesigandos = new ArrayList<>();
        for (Designacion designacion : ultimas) {
            List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(designacion.getIdDesignacion());
            for (Designados designados1 : designados) {
                if (!arbitrosDesigandos.contains(designados1.getArbitro())) {
                    arbitrosDesigandos.add(designados1.getArbitro());
                }
            }
        }
        for (Arbitro arbitro : arbitrosDesigandos) {
            if (!deudaGastoRepository.existsByGastoOriginalAndArbitro(gasto, arbitro)) {
                DeudaGasto deudaGasto = new DeudaGasto();
                deudaGasto.setArbitro(arbitro);
                deudaGasto.setGastoOriginal(gasto);
                deudaGasto.setEstado("PENDIENTE");
                deudaGasto.setMontoAsignado(montoAasignar);
                deudaGasto.setMontoPagado(new BigDecimal("0.00"));
                gasto.addDeuda(deudaGasto);
                deudaGastoRepository.save(deudaGasto);
            }
        }
        transactionRepository.save(gasto);
        return "Árbitros asignados correctamente al gasto ID: " + idGasto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetDetalleTransaccionGastoDTO> traerTransaccionesGastoConRecupero(int page, int size) {
        Page<TransaccionGasto> transaccionesGasto = transaccionGastoRepository.findByRequiereRecupero(
                true, PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
        return transaccionesGasto.map(GetDetalleTransaccionGastoDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GetDetalleTransaccionGastoDTO> traerTodasTransaccionesGastoConRecupero() {
        List<TransaccionGasto> transaccionesGasto = transaccionGastoRepository.findByRequiereRecupero(true);
        return transaccionesGasto.stream()
                .map(GetDetalleTransaccionGastoDTO::new)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GetDetalleTransaccionGastoDTO traerDetalleTransaccionGastoPorId(Long idTransaccion) {
        TransaccionGasto transaccionGasto = transactionRepository.findById(idTransaccion)
                .filter(t -> t instanceof TransaccionGasto)
                .map(t -> (TransaccionGasto) t)
                .orElseThrow(() -> new BadRequestException("Transacción de gasto no encontrada con ID: " + idTransaccion));

        if (!transaccionGasto.getRequiereRecupero()) {
            throw new BadRequestException("La transacción no requiere recupero");
        }

        return new GetDetalleTransaccionGastoDTO(transaccionGasto);
    }

    @Override
    @Transactional
    public String realizarCobroGastoConRecupero(Long idTransaccion, Long idArbitro, BigDecimal montoCobrado) {
        TransaccionGasto transaccionGasto = (TransaccionGasto) transactionRepository.findById(idTransaccion)
                .orElseThrow(() -> new BadRequestException("Transacción de gasto no encontrada con ID: " + idTransaccion));
        if (!transaccionGasto.getRequiereRecupero()) {
            throw new BadRequestException("La transacción no requiere recupero");
        }
        Arbitro arbitro = getArbitroById(idArbitro);

        List<DeudaGasto> deudas = deudaGastoRepository.findByGastoOriginalAndArbitro(transaccionGasto, arbitro);
        if (deudas == null || deudas.isEmpty()) {
            throw new BadRequestException("No se encontró una deuda asociada a este gasto para el árbitro especificado");
        }

        DeudaGasto deudaGasto;
        if (deudas.size() == 1) {
            deudaGasto = deudas.get(0);
        } else {
            deudaGasto = deudas.stream()
                    .filter(d -> d.getEstado() == null || !"PAGADO".equalsIgnoreCase(d.getEstado()))
                    .findFirst()
                    .orElse(null);

            if (deudaGasto == null) {
                deudaGasto = deudaGastoRepository.findTopByGastoOriginalAndArbitroOrderByIdDeudaDesc(transaccionGasto, arbitro);
            }

            log.warn("Aviso: se encontraron {} deudas para gasto {} y arbitro {}. Usando idDeuda: {}", deudas.size(), idTransaccion, idArbitro, (deudaGasto != null ? deudaGasto.getIdDeuda() : "null"));
        }
        if ("PAGADO".equals(deudaGasto.getEstado())) {
            throw new BadRequestException("La deuda ya está completamente pagada");
        }
        BigDecimal nuevoMontoPagado = deudaGasto.getMontoPagado().add(montoCobrado);
        deudaGasto.setMontoPagado(nuevoMontoPagado);
        if (nuevoMontoPagado.compareTo(deudaGasto.getMontoAsignado()) >= 0) {
            deudaGasto.setMontoPagado(deudaGasto.getMontoAsignado());
            deudaGasto.setEstado("PAGADO");
        } else {
            deudaGasto.setMontoPagado(nuevoMontoPagado);
            deudaGasto.setEstado("PENDIENTE");
        }
        TransaccionRecupero transaccionRecupero = new TransaccionRecupero();
        transaccionRecupero.setTipo("INGRESO");
        transaccionRecupero.setMonto(montoCobrado);
        transaccionRecupero.setFechaRegistro(LocalDateTime.now());
        transaccionRecupero.setFechaTransaccion(LocalDate.now());
        transaccionRecupero.setDescripcion("Cobro de gasto con recupero,arbitro: " + arbitro.getNombreCompleto());
        transaccionRecupero.setCaja(cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear())
                .orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear())));
        transaccionRecupero.setDeudaAsociada(deudaGasto);
        Caja cajaActual = cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear())
                .orElseThrow(() -> new NotFoundException("Error al traer la caja"));
        cajaActual.setSaldoActual(cajaActual.getSaldoActual().add(montoCobrado));
        cajaRepository.save(cajaActual);
        transaccionRecuperoRepository.save(transaccionRecupero);
        deudaGastoRepository.save(deudaGasto);
        transactionRepository.save(transaccionGasto);
        return "Cobro realizado con éxito";
    }
}
