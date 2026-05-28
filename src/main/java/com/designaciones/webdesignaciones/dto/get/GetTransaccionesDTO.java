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
    private LocalDateTime fechaRegistro;
    private Long idPrestamo;
    private String nombreConceptoGasto;
    private Boolean requiereRecupero;

    public GetTransaccionesDTO(Transaccion transaccion) {
        this.idTransaccion = transaccion.getIdTransaccion();
        this.tipo = transaccion.getTipo();
        this.monto = transaccion.getMonto();
        this.fecha = transaccion.getFechaTransaccion().atStartOfDay();
        this.descripcion = transaccion.getDescripcion();
        this.fechaRegistro = transaccion.getFechaRegistro();
        if (transaccion instanceof PagoPrestamo) {
            this.idPrestamo = ((PagoPrestamo) transaccion).getPrestamo().getIdPrestamo();
            this.nombreConceptoGasto = "Pago de Préstamo";
        } else if (transaccion instanceof TransaccionGasto) {
            this.nombreConceptoGasto = ((TransaccionGasto) transaccion).getConceptoGasto().getNombre();
            this.requiereRecupero = ((TransaccionGasto) transaccion).getRequiereRecupero();
        } else {
            this.nombreConceptoGasto = "Recupero de Gasto";
            this.requiereRecupero = false;
        }
    }
}
