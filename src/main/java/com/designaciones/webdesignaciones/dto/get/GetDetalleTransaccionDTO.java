package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
import jakarta.annotation.security.DenyAll;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetDetalleTransaccionDTO {
    private Long idTransaccion;
    private String tipoTransaccion;
    private BigDecimal monto;
    private LocalDate fecha;
    private String descripcion;
    private Boolean requiereRecupero;
    private Integer conceptoGastoId;
    private String conceptoGastoNombre;
    private List<Long> idsDeudasDivididas;
    private Long deudaAsociadaId;


    public GetDetalleTransaccionDTO(DeudaGasto deuda) {
        this.idTransaccion = deuda.getGastoOriginal().getIdTransaccion();
        this.tipoTransaccion = deuda.getGastoOriginal().getTipo();
        this.monto = deuda.getGastoOriginal().getMonto();
        this.fecha = deuda.getGastoOriginal().getFechaTransaccion();
        this.descripcion = deuda.getGastoOriginal().getDescripcion();
        this.requiereRecupero = true;
        this.conceptoGastoId = deuda.getGastoOriginal().getConceptoGasto().getIdConceptoGasto();
        this.conceptoGastoNombre = deuda.getGastoOriginal().getConceptoGasto().getNombre();
        this.idsDeudasDivididas = deuda.getGastoOriginal().getDeudasDivididas().stream()
                .map(DeudaGasto::getIdDeuda)
                .toList();
        this.deudaAsociadaId = deuda.getIdDeuda();
    }

    public GetDetalleTransaccionDTO(TransaccionRecupero transaccionRecupero) {
        this.idTransaccion = transaccionRecupero.getIdTransaccion();
        this.tipoTransaccion = transaccionRecupero.getTipo();
        this.monto = transaccionRecupero.getMonto();
        this.fecha = transaccionRecupero.getFechaTransaccion();
        this.descripcion = transaccionRecupero.getDescripcion();
        this.requiereRecupero = false;
        this.conceptoGastoId = transaccionRecupero.getDeudaAsociada().getGastoOriginal().getConceptoGasto().getIdConceptoGasto();
        this.conceptoGastoNombre = transaccionRecupero.getDeudaAsociada().getGastoOriginal().getConceptoGasto().getNombre();
        this.idsDeudasDivididas = transaccionRecupero.getDeudaAsociada().getGastoOriginal().getDeudasDivididas().stream()
                .map(DeudaGasto::getIdDeuda)
                .toList();
        this.deudaAsociadaId = transaccionRecupero.getDeudaAsociada().getIdDeuda();
    }

    public GetDetalleTransaccionDTO(PagoPrestamo pagoPrestamo) {
        this.idTransaccion = pagoPrestamo.getIdTransaccion();
        this.tipoTransaccion = pagoPrestamo.getTipo();
        this.monto = pagoPrestamo.getMonto();
        this.fecha = pagoPrestamo.getFechaTransaccion();
        this.descripcion = pagoPrestamo.getDescripcion();
        this.requiereRecupero = false;
        this.conceptoGastoId = null;
        this.conceptoGastoNombre = null;
        this.idsDeudasDivididas = null;
        this.deudaAsociadaId = null;
    }
}
