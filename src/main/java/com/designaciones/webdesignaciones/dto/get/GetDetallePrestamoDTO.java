package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GetDetallePrestamoDTO {
    private Long idTransaccion;
    private String tipo;
    private BigDecimal monto;
    private LocalDate fechaTransaccion;
    private LocalDateTime fechaRegistro;
    private String descripcion;

    public GetDetallePrestamoDTO(PagoPrestamo pago) {
        this.idTransaccion = pago.getIdTransaccion();
        this.tipo = "PAGO_PRESTAMO";
        this.monto = pago.getMonto();
        this.fechaTransaccion = pago.getFechaTransaccion();
        this.fechaRegistro = pago.getFechaRegistro();
        this.descripcion = pago.getDescripcion();
    }
}
