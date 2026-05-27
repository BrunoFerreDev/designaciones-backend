package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
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
        this.tipo = transaccion.getTipo();
        this.monto = transaccion.getMonto();
        this.fecha = transaccion.getFechaTransaccion().atStartOfDay();
        this.fechaRegistro = transaccion.getFechaTransaccion();
        this.descripcion = transaccion.getDescripcion();

        if (transaccion instanceof PagoPrestamo pago) {
            if (pago.getPrestamo() != null) {
                this.idPrestamo = pago.getPrestamo().getIdPrestamo();
                this.nombreConceptoGasto = "PAGO PRESTAMO";
            }
        } else if (transaccion instanceof TransaccionGasto gasto) {
            if (gasto.getConceptoGasto() != null) {
                this.nombreConceptoGasto = gasto.getConceptoGasto().getNombre();
                this.requiereRecupero = gasto.getRequiereRecupero();
            }
        } else {
            this.idPrestamo = null;
            this.nombreConceptoGasto = "PRESTAMO";
        }
    }
}
