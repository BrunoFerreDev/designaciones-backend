package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDetallePrestamoDTO;
import com.designaciones.webdesignaciones.dto.get.GetPrestamoDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Caja;
import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CajaRepository;
import com.designaciones.webdesignaciones.repository.PagoPrestamoRepository;
import com.designaciones.webdesignaciones.repository.PrestamoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionRepository;
import com.designaciones.webdesignaciones.service.PrestamoService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Connection;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Primary
@Service
@RequiredArgsConstructor
public class PrestamoServiceImpl implements PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final ArbitroRepository arbitroRepository;
    private final CajaRepository cajaRepository;
    private final TransaccionRepository transactionRepository;
    private final PagoPrestamoRepository pagoPrestamoRepository;
    private final DataSource dataSource;

    private Arbitro getArbitroById(Long arbitroId) {
        return arbitroRepository.findById(arbitroId)
                .orElseThrow(() -> new NotFoundException("Árbitro no encontrado con ID: " + arbitroId));
    }

    private Prestamo getPrestamoById(Long prestamoId) {
        return prestamoRepository.findById(prestamoId)
                .orElseThrow(() -> new NotFoundException("Préstamo no encontrado con ID: " + prestamoId));
    }

    @Override
    @Transactional
    public GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado, LocalDate fechaSolicitud) {
        int anioActual = LocalDate.now().getYear();
        boolean esAnioActual = fechaSolicitud.getYear() >= anioActual;

        Caja cajaFinal = esAnioActual
                ? cajaRepository.findByActivoAndAnio(true, anioActual)
                .orElseGet(() -> cajaRepository.cajaSoporte())
                : cajaRepository.cajaSoporte();

        if (cajaFinal == null) {
            throw new NotFoundException("No se encontró una caja válida para registrar la transacción.");
        }

        if (esAnioActual) {
            cajaFinal.setSaldoActual(cajaFinal.getSaldoActual().subtract(montoSolicitado));
            cajaRepository.save(cajaFinal);
        }

        Arbitro arbitro = getArbitroById(arbitroId);

        Prestamo prestamo = new Prestamo();
        prestamo.setArbitro(arbitro);
        prestamo.setMontoSolicitado(montoSolicitado);
        prestamo.setMontoDevuelto(BigDecimal.ZERO);
        prestamo.setFechaSolicitud(fechaSolicitud);
        prestamo.setFechaRegistro(LocalDate.now());
        prestamo.setEstado("PENDIENTE");

        Transaccion transaccion = new Transaccion();
        transaccion.setTipo("EGRESO");
        transaccion.setMonto(montoSolicitado);
        transaccion.setFechaRegistro(LocalDateTime.now());
        transaccion.setFechaTransaccion(fechaSolicitud);
        transaccion.setDescripcion("Préstamo otorgado al árbitro: " + arbitro.getApellido() + " " + arbitro.getNombre());
        transaccion.setCaja(cajaFinal);

        transactionRepository.save(transaccion);
        prestamoRepository.save(prestamo);

        return new GetPrestamoDTO(prestamo);
    }

    @Override
    @Transactional
    public GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado, LocalDate fecha) {
        Caja cajaActual = cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear())
                .orElseThrow(() -> new NotFoundException("ERROR AL TRAER CAJA"));
        cajaActual.setSaldoActual(cajaActual.getSaldoActual().add(montoPagado));
        Prestamo prestamo = getPrestamoById(prestamoId);
        BigDecimal nuevoMontoDevuelto = prestamo.getMontoDevuelto().add(montoPagado);
        prestamo.setMontoDevuelto(nuevoMontoDevuelto);
        if (nuevoMontoDevuelto.compareTo(prestamo.getMontoSolicitado()) >= 0) {
            prestamo.setMontoDevuelto(prestamo.getMontoSolicitado());
            prestamo.setEstado("PAGADO");
        } else {
            prestamo.setMontoDevuelto(nuevoMontoDevuelto);
            prestamo.setEstado("PENDIENTE");
        }
        PagoPrestamo pagoPrestamo = new PagoPrestamo();
        pagoPrestamo.setTipo("INGRESO");
        pagoPrestamo.setMonto(montoPagado);
        pagoPrestamo.setFechaTransaccion(fecha);
        pagoPrestamo.setFechaRegistro(LocalDate.now().atStartOfDay());
        pagoPrestamo.setPrestamo(prestamo);
        pagoPrestamo.setDescripcion("Pago de préstamo " + prestamo.getArbitro().getNombreCompleto());
        pagoPrestamo.setCaja(cajaActual);
        transactionRepository.save(pagoPrestamo);
        prestamoRepository.save(prestamo);
        return new GetPrestamoDTO(prestamo);
    }

    @Override
    @Transactional(readOnly = true)
    public GetPrestamoDTO traerPorId(Long idPrestamo) {
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new BadRequestException("Prestamo no encontrado"));
        return new GetPrestamoDTO(prestamo);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size) {
        Arbitro arbitro = getArbitroById(idArbitro);
        return prestamoRepository.findByArbitro(arbitro, PageRequest.of(page, size, Sort.by("fechaSolicitud").descending()))
                .map(GetPrestamoDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetPrestamoDTO> traerPrestamos(Pageable pageable, String estado) {
        if (estado.equalsIgnoreCase("TODOS")) {
            return prestamoRepository.findAll(pageable).map(GetPrestamoDTO::new);
        } else {
            return prestamoRepository.findAllByEstado(pageable, estado).map(GetPrestamoDTO::new);
        }
    }

    @Override
    @Transactional
    public GetPrestamoDTO actualizarFechaPrestamo(Long idPrestamo, LocalDate nuevaFecha) {
        Prestamo prestamo = getPrestamoById(idPrestamo);
        prestamo.setFechaSolicitud(nuevaFecha);
        prestamoRepository.save(prestamo);
        return new GetPrestamoDTO(prestamo);
    }

    @Override
    @Transactional
    public GetPrestamoDTO actualizarFechaPagoPrestamo(Long idPrestamo, LocalDate nuevaFecha) {
        Transaccion transaccion = transactionRepository.findById(idPrestamo)
                .orElseThrow(() -> new BadRequestException("Préstamo no encontrado con ID: " + idPrestamo));
        transaccion.setFechaTransaccion(nuevaFecha);
        transactionRepository.save(transaccion);
        if (transaccion instanceof PagoPrestamo) {
            return new GetPrestamoDTO(((PagoPrestamo) transaccion).getPrestamo());
        } else {
            throw new BadRequestException("La transacción con ID: " + idPrestamo + " no es un pago de préstamo");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetDetallePrestamoDTO> traerDetallePrestamo(Long idPrestamo, int page, int size) {
        Prestamo prestamo = getPrestamoById(idPrestamo);
        Page<PagoPrestamo> pagos = pagoPrestamoRepository.findByPrestamo(prestamo, PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
        return pagos.map(GetDetallePrestamoDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarReportePrestamos() throws Exception {
        InputStream reportStream = getClass().getResourceAsStream("/static/reportes/PrestamosFinal.jasper");
        if (reportStream == null) {
            throw new Exception("No se encontró el archivo del reporte en el classpath.");
        }

        JasperReport report = (JasperReport) JRLoader.loadObject(reportStream);
        JasperPrint print;
        try (Connection conn = dataSource.getConnection()) {
            print = JasperFillManager.fillReport(report, null, conn);
        }

        return JasperExportManager.exportReportToPdf(print);
    }
}
