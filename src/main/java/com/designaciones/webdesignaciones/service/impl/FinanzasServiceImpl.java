package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.*;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.ReporteDto;
import com.designaciones.webdesignaciones.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Fachada para FinanzasService que delega a los servicios segregados de dominio (LSP + SRP).
 */
@Service
@RequiredArgsConstructor
public class FinanzasServiceImpl implements FinanzasService {

    private final PrestamoService prestamoService;
    private final GastoService gastoService;
    private final CajaService cajaService;
    private final TransaccionService transaccionService;
    private final RecuperoGastoService recuperoGastoService;

    // --- PrestamoService ---
    @Override
    public GetPrestamoDTO registrarPrestamo(Long arbitroId, BigDecimal montoSolicitado, LocalDate fechaSolicitud) {
        return prestamoService.registrarPrestamo(arbitroId, montoSolicitado, fechaSolicitud);
    }

    @Override
    public GetPrestamoDTO registrarPagoPrestamo(Long prestamoId, BigDecimal montoPagado, LocalDate fecha) {
        return prestamoService.registrarPagoPrestamo(prestamoId, montoPagado, fecha);
    }

    @Override
    public GetPrestamoDTO traerPorId(Long idPrestamo) {
        return prestamoService.traerPorId(idPrestamo);
    }

    @Override
    public Page<GetPrestamoDTO> traerPrestamosPorArbitro(Long idArbitro, int page, int size) {
        return prestamoService.traerPrestamosPorArbitro(idArbitro, page, size);
    }

    @Override
    public Page<GetPrestamoDTO> traerPrestamos(Pageable pageable, String estado) {
        return prestamoService.traerPrestamos(pageable, estado);
    }

    @Override
    public GetPrestamoDTO actualizarFechaPrestamo(Long idPrestamo, LocalDate nuevaFecha) {
        return prestamoService.actualizarFechaPrestamo(idPrestamo, nuevaFecha);
    }

    @Override
    public GetPrestamoDTO actualizarFechaPagoPrestamo(Long idPrestamo, LocalDate nuevaFecha) {
        return prestamoService.actualizarFechaPagoPrestamo(idPrestamo, nuevaFecha);
    }

    @Override
    public Page<GetDetallePrestamoDTO> traerDetallePrestamo(Long idPrestamo, int page, int size) {
        return prestamoService.traerDetallePrestamo(idPrestamo, page, size);
    }

    @Override
    public byte[] generarReportePrestamos() throws Exception {
        return prestamoService.generarReportePrestamos();
    }

    // --- GastoService ---
    @Override
    public String crearConcepto(ConceptoGastoDTO nuevoConcepto) {
        return gastoService.crearConcepto(nuevoConcepto);
    }

    @Override
    public Page<GetConceptosDTO> traerConceptos(int page, int size) {
        return gastoService.traerConceptos(page, size);
    }

    @Override
    public GetGastoDTO registrarGasto(GastoDTO gasto) {
        return gastoService.registrarGasto(gasto);
    }

    @Override
    public GetGastoDTO actualizarGasto(Long idGasto, GastoDTO gastoDTO) {
        return gastoService.actualizarGasto(idGasto, gastoDTO);
    }

    @Override
    public ReporteDto generarReporteGasto(Long idGasto) throws Exception {
        return gastoService.generarReporteGasto(idGasto);
    }

    // --- CajaService ---
    @Override
    public GetCajaDTO traerCajaActual() {
        return cajaService.traerCajaActual();
    }

    // --- TransaccionService ---
    @Override
    public Page<GetTransaccionesDTO> traerTransacciones(int page, int size) {
        return transaccionService.traerTransacciones(page, size);
    }

    @Override
    public GetTransaccionesDTO traerTransaccionPorId(Long idTransaccion) {
        return transaccionService.traerTransaccionPorId(idTransaccion);
    }

    // --- RecuperoGastoService ---
    @Override
    public String asociarGastoArbitro(Long idGasto, Long idArbitro, BigDecimal montoAsignado) {
        return recuperoGastoService.asociarGastoArbitro(idGasto, idArbitro, montoAsignado);
    }

    @Override
    public String asignarArbitrosAGasto(Long idGasto, BigDecimal montoAasignar) {
        return recuperoGastoService.asignarArbitrosAGasto(idGasto, montoAasignar);
    }

    @Override
    public Page<GetDetalleTransaccionGastoDTO> traerTransaccionesGastoConRecupero(int page, int size) {
        return recuperoGastoService.traerTransaccionesGastoConRecupero(page, size);
    }

    @Override
    public List<GetDetalleTransaccionGastoDTO> traerTodasTransaccionesGastoConRecupero() {
        return recuperoGastoService.traerTodasTransaccionesGastoConRecupero();
    }

    @Override
    public GetDetalleTransaccionGastoDTO traerDetalleTransaccionGastoPorId(Long idTransaccion) {
        return recuperoGastoService.traerDetalleTransaccionGastoPorId(idTransaccion);
    }

    @Override
    public String realizarCobroGastoConRecupero(Long idTransaccion, Long idArbitro, BigDecimal montoCobrado) {
        return recuperoGastoService.realizarCobroGastoConRecupero(idTransaccion, idArbitro, montoCobrado);
    }
}