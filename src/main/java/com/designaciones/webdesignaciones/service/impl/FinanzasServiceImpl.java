package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.FinanzasService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.util.JRLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Connection;
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
    private final DataSource dataSource;
    private final DeudaGastoRepository deudaGastoRepository;

    @Override
    public GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado, LocalDate fechaSolicitud) {
        try {
            Arbitro arbitro = getArbitroById(arbitroId);
            Prestamo prestamo = new Prestamo();
            prestamo.setArbitro(arbitro);
            prestamo.setMontoSolicitado(montoSolicitado);
            prestamo.setMontoDevuelto(BigDecimal.ZERO);
            prestamo.setFechaSolicitud(LocalDate.now());
            prestamo.setEstado("PENDIENTE");
            prestamo.setFechaSolicitud(fechaSolicitud);
            prestamo.setFechaRegistro(LocalDateTime.now().toLocalDate());
            Transaccion transaccion = new Transaccion();
            transaccion.setTipo("EGRESO");
            transaccion.setMonto(montoSolicitado);
            transaccion.setFechaRegistro(LocalDateTime.now());
            transaccion.setFechaTransaccion(fechaSolicitud);
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
    public GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado, LocalDate fecha) {
        try {
            Prestamo prestamo = getPrestamoById(prestamoId);
            BigDecimal nuevoMontoDevuelto = prestamo.getMontoDevuelto().add(montoPagado);
            prestamo.setMontoDevuelto(nuevoMontoDevuelto);
            if (nuevoMontoDevuelto.compareTo(prestamo.getMontoSolicitado()) >= 0) {
                prestamo.setEstado("PAGADO");
            }
            prestamo.setEstado("PENDIENTE");
            PagoPrestamo pagoPrestamo = new PagoPrestamo();
            pagoPrestamo.setTipo("INGRESO");
            pagoPrestamo.setMonto(montoPagado);
            pagoPrestamo.setFechaTransaccion(fecha);
            pagoPrestamo.setFechaRegistro(LocalDate.now().atStartOfDay());
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
            transaccionGasto.setFechaRegistro(LocalDate.now().atStartOfDay());
            transaccionGasto.setFechaTransaccion(LocalDate.from(gasto.getFecha()));
            transaccionGasto.setMonto(gasto.getMonto());
            transaccionGasto.setTipo(gasto.getTipo());
            transaccionGasto.setCaja(cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear()).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear())));
            transaccionGasto.setRequiereRecupero(gasto.getRequiereRecupero());
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
        return prestamoRepository.findByArbitro(arbitro, PageRequest.of(page, size, Sort.by("fechaSolicitud").descending())).map(GetPrestamoDTO::new);
    }

    @Override
    public GetCajaDTO traerCajaActual() {
        int anioActual = LocalDate.now().getYear();
        return new GetCajaDTO(cajaRepository.findByActivoAndAnio(true, anioActual).orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + anioActual)));
    }

    @Override
    public Page<GetTransaccionesDTO> traerTransacciones(int page, int size) {
        Page<Transaccion> transaccions = transactionRepository.findAll(PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
        return transaccions.map(GetTransaccionesDTO::new);
    }

    @Override
    public Page<GetPrestamoDTO> traerPrestamos(int page, int size) {
        return prestamoRepository.findAll(PageRequest.of(page, size, Sort.by("fechaSolicitud").descending())).map(GetPrestamoDTO::new);
    }

    @Override
    public GetGastoDTO actualizarGasto(Long idGasto, GastoDTO gastoDTO) {
        try {
            TransaccionGasto gasto = transactionRepository.findById(idGasto).filter(t -> t instanceof TransaccionGasto).map(t -> (TransaccionGasto) t).orElseThrow(() -> new BadRequestException("Gasto no encontrado"));
            gasto.setFechaTransaccion(gastoDTO.getFecha().toLocalDate());
            gasto.setTipo(gastoDTO.getTipo());
            gasto.setMonto(gastoDTO.getMonto());
            gasto.setDescripcion(gastoDTO.getDescripcion());
            gasto.setRequiereRecupero(gastoDTO.getRequiereRecupero());
            transactionRepository.save(gasto);
            return new GetGastoDTO(gasto);
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public GetPrestamoDTO actualizarFechaPrestamo(Long idPrestamo, LocalDate nuevaFecha) {
        try {
            Prestamo prestamo = getPrestamoById(idPrestamo);
            prestamo.setFechaSolicitud(nuevaFecha);
            prestamoRepository.save(prestamo);
            return new GetPrestamoDTO(prestamo);
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public byte[] generarReportePrestamos() throws Exception {
        // El '/' inicial le indica a Java que busque desde la raíz de la carpeta 'resources'
        InputStream reportStream = getClass().getResourceAsStream("/static/PrestamosFinal.jasper");

        if (reportStream == null) {
            throw new Exception("No se encontró el archivo del reporte en el classpath.");
        }

        /*JasperReport report = JasperCompileManager.compileReport(reportStream);*/
        JasperReport report = (JasperReport) JRLoader.loadObject(reportStream);
        JasperPrint print;
        try (Connection conn = dataSource.getConnection()) {
            print = JasperFillManager.fillReport(report, null, conn);
            ;
        }

        // 5. Exportar a byte array para devolverlo en la petición HTTP
        return JasperExportManager.exportReportToPdf(print);
    }

    @Override
    public String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado) {
        try {
            TransaccionGasto gasto = transactionRepository.findById(idGasto)
                    .filter(t -> t instanceof TransaccionGasto)
                    .map(t -> (TransaccionGasto) t)
                    .orElseThrow(() -> new BadRequestException("Gasto no encontrado con ID: " + idGasto));

            Arbitro arbitro = getArbitroById(idArbitro);
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

        } catch (BadRequestException e) {
            // Dejamos pasar las excepciones de negocio que ya controlamos
            throw e;
        } catch (Exception e) {
            // Imprimimos el error real en la consola para poder debugear
            e.printStackTrace();
            // Lanzamos el error, pero ahora sabremos qué pasó
            throw new BadRequestException("Error interno al asociar el gasto: " + e.getMessage());
        }
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
