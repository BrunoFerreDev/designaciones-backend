package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetTransaccionesDTO {
    private Long idTransaccion;
    private String tipo;
    private BigDecimal monto;
    private LocalDateTime fecha;
    private String descripcion;
    private LocalDate fechaRegistro;
    private Long idPrestamo;
    private String nombreConceptoGasto;
    private Boolean requiereRecupero;

    public GetTransaccionesDTO(Transaccion transaccion) {
        this.idTransaccion = transaccion.getIdTransaccion();
        this.monto = transaccion.getMonto();
        this.fecha = transaccion.getFechaTransaccion().atStartOfDay();
        this.fechaRegistro = transaccion.getFechaTransaccion();

        if (transaccion instanceof PagoPrestamo pago) {
            if (pago.getPrestamo() != null) {
                this.idPrestamo = pago.getPrestamo().getIdPrestamo();
                this.nombreConceptoGasto = "PAGO PRESTAMO";
                this.descripcion = "Pago de préstamo: " + pago.getPrestamo().getArbitro().getNombreCompleto();
                this.tipo = "Pago de Préstamo";
            }
        } else if (transaccion instanceof TransaccionGasto gasto) {
            if (gasto.getConceptoGasto() != null) {
                this.nombreConceptoGasto = gasto.getConceptoGasto().getNombre();
                this.requiereRecupero = gasto.getRequiereRecupero();
                this.descripcion = "Gasto: " + gasto.getDescripcion();
                this.tipo = "Gasto";
            }
        } else if (transaccion instanceof TransaccionRecupero recupero) {
            if (recupero.getDeudaAsociada() != null) {
                this.idPrestamo = recupero.getDeudaAsociada().getIdDeuda();
                this.tipo = "Reintegro de Gasto";
                this.nombreConceptoGasto = "RECUPERO DE GASTO";
                this.descripcion = recupero.getDeudaAsociada().getGastoOriginal().getDescripcion();
            }
        } else {
            this.idPrestamo = null;
            this.nombreConceptoGasto = "PRESTAMO";
            this.descripcion = transaccion.getDescripcion();
            this.tipo = "Préstamo";
        }
    }
}
