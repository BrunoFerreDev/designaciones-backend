package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


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
    private final TransaccionGastoRepository transaccionGastoRepository;
    private final TransaccionRecuperoRepository transaccionRecuperoRepository;
    private final PagoPrestamoRepository pagoPrestamoRepository;
    private final DesignacionRepository designacionRepository;
    private final DesignadosRepository designadosRepository;

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
            ConceptoGasto conceptoGasto = ConceptoGasto.builder().nombre(nuevoConcepto.getNombre()).descripcion(nuevoConcepto.getDescripcion()).build();
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
        InputStream reportStream = getClass().getResourceAsStream("/static/PrestamosFinal.jasper");
        if (reportStream == null) {
            throw new Exception("No se encontró el archivo del reporte en el classpath.");
        }

        JasperReport report = (JasperReport) JRLoader.loadObject(reportStream);
        JasperPrint print;
        try (Connection conn = dataSource.getConnection()) {
            print = JasperFillManager.fillReport(report, null, conn);
            ;
        }

        return JasperExportManager.exportReportToPdf(print);
    }

    @Override
    public String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado) {
        try {
            TransaccionGasto gasto = transactionRepository.findById(idGasto).filter(t -> t instanceof TransaccionGasto).map(t -> (TransaccionGasto) t).orElseThrow(() -> new BadRequestException("Gasto no encontrado con ID: " + idGasto));
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

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BadRequestException("Error interno al asociar el gasto: " + e.getMessage());
        }
    }

    @Override
    public GetTransaccionesDTO traerTransaccionPorId(Long idTransaccion) {
        try {
            Transaccion transaccion = transactionRepository.findById(idTransaccion).orElseThrow(() -> new BadRequestException("Transacción no encontrada con ID: " + idTransaccion));
            return new GetTransaccionesDTO(transaccion);
        } catch (Exception e) {
            throw new BadRequestException(e.getMessage());
        }
    }

    @Override
    public Page<GetDetalleTransaccionGastoDTO> traerTransaccionesGastoConRecupero(int page, int size) {
        try {
            Page<TransaccionGasto> transaccionesGasto = transaccionGastoRepository.findByRequiereRecupero(true, PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
            return transaccionesGasto.map(GetDetalleTransaccionGastoDTO::new);
        } catch (Exception e) {
            throw new BadRequestException("Error al traer transacciones de gasto con recupero: " + e.getMessage());
        }
    }

    @Override
    public List<GetDetalleTransaccionGastoDTO> traerTodasTransaccionesGastoConRecupero() {
        try {
            List<TransaccionGasto> transaccionesGasto = transaccionGastoRepository.findByRequiereRecupero(true);
            return transaccionesGasto.stream()
                    .map(GetDetalleTransaccionGastoDTO::new)
                    .toList();
        } catch (Exception e) {
            throw new BadRequestException("Error al traer todas las transacciones de gasto con recupero: " + e.getMessage());
        }
    }

    @Override
    public GetDetalleTransaccionGastoDTO traerDetalleTransaccionGastoPorId(Long idTransaccion) {
        try {
            TransaccionGasto transaccionGasto = transactionRepository.findById(idTransaccion)
                    .filter(t -> t instanceof TransaccionGasto)
                    .map(t -> (TransaccionGasto) t)
                    .orElseThrow(() -> new BadRequestException("Transacción de gasto no encontrada con ID: " + idTransaccion));

            if (!transaccionGasto.getRequiereRecupero()) {
                throw new BadRequestException("La transacción no requiere recupero");
            }

            return new GetDetalleTransaccionGastoDTO(transaccionGasto);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Error al traer detalle de transacción de gasto: " + e.getMessage());
        }
    }

    @Override
    public String realizarCobroGastoConRecupero(Long idTransaccion, Long idArbitro, BigDecimal montoCobrado) {
        try {
            TransaccionGasto transaccionGasto = (TransaccionGasto) transactionRepository.findById(idTransaccion).orElseThrow(() -> new BadRequestException("Transacción de gasto no encontrada con ID: " + idTransaccion));
            if (!transaccionGasto.getRequiereRecupero()) {
                throw new BadRequestException("La transacción no requiere recupero");
            }
            Arbitro arbitro = getArbitroById(idArbitro);

            // Manejo robusto ante posibles duplicados en la BD: obtenemos todas las deudas asociadas
            java.util.List<DeudaGasto> deudas = deudaGastoRepository.findByGastoOriginalAndArbitro(transaccionGasto, arbitro);
            if (deudas == null || deudas.isEmpty()) {
                throw new BadRequestException("No se encontró una deuda asociada a este gasto para el árbitro especificado");
            }

            DeudaGasto deudaGasto;
            if (deudas.size() == 1) {
                deudaGasto = deudas.get(0);
            } else {
                // Si hay múltiples, preferimos una que no esté PAGADA
                deudaGasto = deudas.stream()
                        .filter(d -> d.getEstado() == null || !"PAGADO".equalsIgnoreCase(d.getEstado()))
                        .findFirst()
                        .orElse(null);

                // Si todavía es null, tomamos la última creada (por id) para tener determinismo
                if (deudaGasto == null) {
                    deudaGasto = deudaGastoRepository.findTopByGastoOriginalAndArbitroOrderByIdDeudaDesc(transaccionGasto, arbitro);
                }

                System.err.println("Aviso: se encontraron " + deudas.size() + " deudas para gasto " + idTransaccion + " y arbitro " + idArbitro + ". Usando idDeuda: " + (deudaGasto != null ? deudaGasto.getIdDeuda() : "null"));
            }
            if (deudaGasto.getEstado().equals("PAGADO")) {
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
            deudaGastoRepository.save(deudaGasto);
            transactionRepository.save(transaccionGasto);
            return "Cobro realizado con éxito";
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Page<GetDetallePrestamoDTO> traerDetallePrestamo(Long idPrestamo, int page, int size) {
        try {
            Prestamo prestamo = getPrestamoById(idPrestamo);
            Page<PagoPrestamo> pagos = pagoPrestamoRepository.findByPrestamo(prestamo, PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
            return pagos.map(GetDetallePrestamoDTO::new);
        } catch (Exception e) {
            throw new BadRequestException("Error al traer detalle del préstamo: " + e.getMessage());
        }
    }

    @Override
    public String asignarArbitrosAGasto(Long idGasto, BigDecimal montoAasignar) {
        try {
            TransaccionGasto gasto = (TransaccionGasto) transactionRepository.findById(idGasto).orElseThrow(() -> new BadRequestException("Gasto no encotrado con ID: " + idGasto));
            if (!gasto.getRequiereRecupero()) {
                throw new BadRequestException("El gasto no requiere recupero, no se pueden asignar árbitros");
            }
            List<Designacion> ultimas = designacionRepository.findByFechaBetween(gasto.getFechaTransaccion().atStartOfDay(), gasto.getFechaTransaccion().plusDays(7).atTime(23, 59, 59));
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
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public byte[] generarReporteGasto(Long idGasto) throws Exception {
        Transaccion transaccion = transactionRepository.findById(idGasto)
                .orElseThrow(() -> new BadRequestException("Transacción no encontrada con ID: " + idGasto));

        if (!(transaccion instanceof TransaccionGasto)) {
            throw new BadRequestException("La transacción con ID: " + idGasto + " no es un gasto");
        }

        InputStream reportStream = getClass().getResourceAsStream("/static/GastoRecupero.jrxml");
        if (reportStream == null) {
            throw new Exception("No se encontró el archivo JRXML del reporte en el classpath.");
        }

        JasperReport report = JasperCompileManager.compileReport(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("idTranssacion", Integer.parseInt(idGasto.toString()));

        JasperPrint print;
        try (Connection conn = dataSource.getConnection()) {
            // 3. Fill the compiled report
            print = JasperFillManager.fillReport(report, parameters, conn);
        }

        return JasperExportManager.exportReportToPdf(print);
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