package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.DashboardEjecutivoDTO;
import com.designaciones.webdesignaciones.model.Caja;
import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CajaRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.DeudaGastoRepository;
import com.designaciones.webdesignaciones.repository.PrestamoRepository;
import com.designaciones.webdesignaciones.repository.TransaccionRepository;
import com.designaciones.webdesignaciones.service.FinanzasDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FinanzasDashboardServiceImpl implements FinanzasDashboardService {

    private final CajaRepository cajaRepository;
    private final TransaccionRepository transaccionRepository;
    private final PrestamoRepository prestamoRepository;
    private final DeudaGastoRepository deudaGastoRepository;
    private final DesignacionRepository designacionRepository;
    private final DesignadosRepository designadosRepository;
    private final ArbitroRepository arbitroRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardEjecutivoDTO obtenerDashboardEjecutivo(Integer mes, Integer anio) {
        if (anio == null) {
            anio = LocalDate.now().getYear();
        }
        if (mes == null) {
            mes = LocalDate.now().getMonthValue();
        }

        BigDecimal saldoCajaActual = cajaRepository.findByActivoAndAnio(true, anio)
                .map(Caja::getSaldoActual)
                .orElse(BigDecimal.ZERO);

        LocalDate startDate = LocalDate.of(anio, mes, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaccion> transacciones = transaccionRepository.findByFechaTransaccionBetween(startDate, endDate);

        BigDecimal ingresosMes = transacciones.stream()
                .filter(t -> "INGRESO".equalsIgnoreCase(t.getTipo()))
                .map(Transaccion::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal egresosMes = transacciones.stream()
                .filter(t -> "EGRESO".equalsIgnoreCase(t.getTipo()))
                .map(Transaccion::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balanceMes = ingresosMes.subtract(egresosMes);

        List<Prestamo> prestamosPendientes = prestamoRepository.findByEstado("PENDIENTE");
        BigDecimal totalPrestamosPorCobrar = prestamosPendientes.stream()
                .map(p -> {
                    BigDecimal solicitado = p.getMontoSolicitado() != null ? p.getMontoSolicitado() : BigDecimal.ZERO;
                    BigDecimal devuelto = p.getMontoDevuelto() != null ? p.getMontoDevuelto() : BigDecimal.ZERO;
                    return solicitado.subtract(devuelto);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DeudaGasto> deudasPendientes = deudaGastoRepository.findByEstado("PENDIENTE");
        BigDecimal totalGastosRecuperoPorCobrar = deudasPendientes.stream()
                .map(d -> {
                    BigDecimal asignado = d.getMontoAsignado() != null ? d.getMontoAsignado() : BigDecimal.ZERO;
                    BigDecimal pagado = d.getMontoPagado() != null ? d.getMontoPagado() : BigDecimal.ZERO;
                    return asignado.subtract(pagado);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Designacion> designaciones = designacionRepository.findByMesAndAnio(mes, anio);
        long cantidadPartidosMes = designaciones.stream()
                .mapToLong(d -> d.getCantidadPartidos() != null ? d.getCantidadPartidos() : 0L)
                .sum();

        List<Long> idDesignaciones = designaciones.stream()
                .map(Designacion::getIdDesignacion)
                .toList();

        BigDecimal totalArancelesAbonados = BigDecimal.ZERO;
        if (!idDesignaciones.isEmpty()) {
            List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacionIn(idDesignaciones);
            totalArancelesAbonados = designados.stream()
                    .map(Designados::getMontoPercibido)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        int arbitrosActivos = (int) arbitroRepository.countByEstadoSistemaTrue();
        int arbitrosDisponiblesFinDeSemana = (int) arbitroRepository.countArbitrosDisponiblesFinDeSemana();

        return new DashboardEjecutivoDTO(
                saldoCajaActual,
                ingresosMes,
                egresosMes,
                balanceMes,
                totalPrestamosPorCobrar,
                totalGastosRecuperoPorCobrar,
                cantidadPartidosMes,
                totalArancelesAbonados,
                arbitrosActivos,
                arbitrosDisponiblesFinDeSemana
        );
    }
}
