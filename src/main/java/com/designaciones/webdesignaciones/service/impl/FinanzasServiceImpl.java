package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.PrestamoDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.ConceptoGasto;
import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.FinanzasService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FinanzasServiceImpl implements FinanzasService {
    private final ConceptoGastoRepository conceptoGastoRepository;
    private final PrestamoRepository prestamoRepository;
    private final TransaccionRepository transactionRepository;
    private final ArbitroRepository arbitroRepository;
    private final CajaRepository cajaRepository;

    @Override
    public GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado) {
        try {
            Arbitro arbitro = getArbitroById(arbitroId);
            Prestamo prestamo = new Prestamo();
            prestamo.setArbitro(arbitro);
            prestamo.setMontoSolicitado(montoSolicitado);
            prestamo.setMontoDevuelto(BigDecimal.ZERO);
            prestamo.setFechaSolicitud(LocalDate.now());
            prestamo.setEstado("PENDIENTE");
            Transaccion transaccion = new Transaccion();
            transaccion.setTipo("EGRESO");
            transaccion.setMonto(montoSolicitado);
            transaccion.setFecha(LocalDateTime.now());
            transaccion.setDescripcion("Préstamo otorgado al árbitro : " + arbitro.getApellido() + " " + arbitro.getNombre());
            transaccion.setCaja(cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear()).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear())));
            transactionRepository.save(transaccion);
            prestamoRepository.save(prestamo);
            return new GetPrestamoDTO(prestamo);
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado) {
        try {
            Prestamo prestamo = getPrestamoById(prestamoId);
            BigDecimal nuevoMontoDevuelto = prestamo.getMontoDevuelto().add(montoPagado);
            prestamo.setMontoDevuelto(nuevoMontoDevuelto);
            if (nuevoMontoDevuelto.compareTo(prestamo.getMontoSolicitado()) >= 0) {
                prestamo.setEstado("PAGADO");
            }
            PagoPrestamo pagoPrestamo = new PagoPrestamo();
            pagoPrestamo.setTipo("INGRESO");
            pagoPrestamo.setMonto(montoPagado);
            pagoPrestamo.setFecha(LocalDateTime.now());
            pagoPrestamo.setDescripcion("Pago de préstamo ID: " + prestamoId);
            pagoPrestamo.setPrestamo(prestamo);
            pagoPrestamo.setCaja(cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear()).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear())));
            transactionRepository.save(pagoPrestamo);
            prestamoRepository.save(prestamo);
            return new GetPrestamoDTO(prestamo);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public GetPrestamoDTO traerPorId(Long idPrestamo) {
        try {
            Prestamo prestamo = prestamoRepository.findById(idPrestamo).orElseThrow(() -> new BadRequestException("Prestamo no encontrado"));
            return new GetPrestamoDTO(prestamo);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String crearConcepto(ConceptoGastoDTO nuevoConcepto) {
        try {
            ConceptoGasto conceptoGasto = ConceptoGasto.builder()
                    .nombre(nuevoConcepto.getNombre()).
                    descripcion(nuevoConcepto.getDescripcion())
                    .build();
            conceptoGastoRepository.save(conceptoGasto);
            return "Concepto Guardado Correctamente";
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public GetGastoDTO registrarGasto(GastoDTO gasto) {
        try {
            TransaccionGasto transaccionGasto = new TransaccionGasto();
            transaccionGasto.setConceptoGasto(getConceptoById(gasto.getConcepto()));
            transaccionGasto.setDescripcion(gasto.getDescripcion());
            transaccionGasto.setFecha(gasto.getFecha());
            transaccionGasto.setMonto(gasto.getMonto());
            transaccionGasto.setTipo(gasto.getTipo());
            transaccionGasto.setCaja(cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear()).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear())));
            transactionRepository.save(transaccionGasto);
            return new GetGastoDTO(transaccionGasto);
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public Page<GetConceptosDTO> traerConceptos(int page, int size) {
        return conceptoGastoRepository.findAll(PageRequest.of(page, size)).map(GetConceptosDTO::new);
    }

    @Override
    public Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size) {
        Arbitro arbitro = getArbitroById(idArbitro);
        return prestamoRepository.findByArbitro(arbitro, PageRequest.of(page, size)).map(GetPrestamoDTO::new);
    }

    @Override
    public GetCajaDTO traerCajaActual() {
        int anioActual = LocalDate.now().getYear();
        return new GetCajaDTO(cajaRepository.findByActivoAndAnio(true, anioActual).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + anioActual)));
    }

    @Override
    public Page<GetTransaccionesDTO> traerTransacciones(int page, int size) {
        return transactionRepository.findAll(PageRequest.of(page, size)).map(GetTransaccionesDTO::new);
    }

    @Override
    public Page<GetPrestamoDTO> traerPrestamos(int page, int size) {
        return prestamoRepository.findAll(PageRequest.of(page, size)).map(GetPrestamoDTO::new);
    }

    private Arbitro getArbitroById(Long arbitroId) {
        return arbitroRepository.findById(arbitroId).orElseThrow(() -> new RuntimeException("Árbitro no encontrado con ID: " + arbitroId));
    }

    private Prestamo getPrestamoById(Long prestamoId) {
        return prestamoRepository.findById(prestamoId).orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + prestamoId));
    }

    private ConceptoGasto getConceptoById(Long idConcepto) {
        return conceptoGastoRepository.findById(idConcepto).orElseThrow(() -> new BadRequestException("Concepto no encontrado"));
    }
}
