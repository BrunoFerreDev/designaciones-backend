package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetConceptosDTO;
import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.ReporteDto;
import com.designaciones.webdesignaciones.model.Caja;
import com.designaciones.webdesignaciones.model.ConceptoGasto;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.repository.CajaRepository;
import com.designaciones.webdesignaciones.repository.ConceptoGastoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionRepository;
import com.designaciones.webdesignaciones.service.GastoService;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Primary
@Service
@RequiredArgsConstructor
public class GastoServiceImpl implements GastoService {

    private final ConceptoGastoRepository conceptoGastoRepository;
    private final CajaRepository cajaRepository;
    private final TransaccionRepository transactionRepository;
    private final DataSource dataSource;

    private ConceptoGasto getConceptoById(Long idConcepto) {
        return conceptoGastoRepository.findById(idConcepto)
                .orElseThrow(() -> new NotFoundException("Concepto no encontrado"));
    }

    @Override
    @Transactional
    public String crearConcepto(ConceptoGastoDTO nuevoConcepto) {
        ConceptoGasto conceptoGasto = ConceptoGasto.builder()
                .nombre(nuevoConcepto.getNombre())
                .descripcion(nuevoConcepto.getDescripcion())
                .build();
        conceptoGastoRepository.save(conceptoGasto);
        return "Concepto Guardado Correctamente";
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GetConceptosDTO> traerConceptos(int page, int size) {
        return conceptoGastoRepository.findAll(PageRequest.of(page, size)).map(GetConceptosDTO::new);
    }

    @Override
    @Transactional
    public GetGastoDTO registrarGasto(GastoDTO gasto) {
        Caja cajaActual = cajaRepository.findByActivoAndAnio(true, LocalDate.now().getYear())
                .orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + LocalDate.now().getYear()));
        cajaActual.setSaldoActual(cajaActual.getSaldoActual().subtract(gasto.getMonto()));
        TransaccionGasto transaccionGasto = new TransaccionGasto();
        transaccionGasto.setConceptoGasto(getConceptoById(gasto.getConcepto()));
        transaccionGasto.setDescripcion(gasto.getDescripcion());
        transaccionGasto.setFechaRegistro(LocalDate.now().atStartOfDay());
        transaccionGasto.setFechaTransaccion(LocalDate.from(gasto.getFecha()));
        transaccionGasto.setMonto(gasto.getMonto());
        transaccionGasto.setTipo(gasto.getTipo());
        transaccionGasto.setCaja(cajaActual);
        transaccionGasto.setRequiereRecupero(gasto.getRequiereRecupero());
        transactionRepository.save(transaccionGasto);
        cajaRepository.save(cajaActual);
        return new GetGastoDTO(transaccionGasto);
    }

    @Override
    @Transactional
    public GetGastoDTO actualizarGasto(Long idGasto, GastoDTO gastoDTO) {
        TransaccionGasto gasto = transactionRepository.findById(idGasto)
                .filter(t -> t instanceof TransaccionGasto)
                .map(t -> (TransaccionGasto) t)
                .orElseThrow(() -> new BadRequestException("Gasto no encontrado"));
        gasto.setFechaTransaccion(gastoDTO.getFecha().toLocalDate());
        gasto.setTipo(gastoDTO.getTipo());
        gasto.setMonto(gastoDTO.getMonto());
        gasto.setDescripcion(gastoDTO.getDescripcion());
        gasto.setRequiereRecupero(gastoDTO.getRequiereRecupero());
        transactionRepository.save(gasto);
        return new GetGastoDTO(gasto);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteDto generarReporteGasto(Long idGasto) throws Exception {
        Transaccion transaccion = transactionRepository.findById(idGasto)
                .orElseThrow(() -> new BadRequestException("Transacción no encontrada con ID: " + idGasto));

        if (!(transaccion instanceof TransaccionGasto)) {
            throw new BadRequestException("La transacción con ID: " + idGasto + " no es un gasto");
        }

        String nombreConcepto = ((TransaccionGasto) transaccion).getConceptoGasto().getNombre();
        String fechaTransaccion = transaccion.getFechaTransaccion().toString();
        InputStream reportStream = getClass().getResourceAsStream("/static/reportes/GastoRecupero.jasper");
        if (reportStream == null) {
            throw new Exception("No se encontró el archivo .jasper del reporte en el classpath.");
        }

        JasperReport report = (JasperReport) JRLoader.loadObject(reportStream);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("idTranssacion", Integer.parseInt(idGasto.toString()));

        JasperPrint print;
        try (Connection conn = dataSource.getConnection()) {
            print = JasperFillManager.fillReport(report, parameters, conn);
        }

        byte[] pdfBytes = JasperExportManager.exportReportToPdf(print);

        return new ReporteDto(pdfBytes, nombreConcepto, fechaTransaccion);
    }
}
