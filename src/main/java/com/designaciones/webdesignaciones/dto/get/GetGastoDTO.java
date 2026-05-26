package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetGastoDTO {
    private Long idGasto;
    private String tipo; // "INGRESO" o "EGRESO"
    private BigDecimal monto;
    private LocalDateTime fecha;
    private String descripcion;
    private String concepto;

    public GetGastoDTO(TransaccionGasto transaccionGasto) {
        this.idGasto = transaccionGasto.getIdTransaccion();
        this.tipo = transaccionGasto.getTipo();
        this.monto = transaccionGasto.getMonto();
        this.fecha = transaccionGasto.getFecha();
        this.descripcion = transaccionGasto.getDescripcion();
        this.concepto = transaccionGasto.getConceptoGasto().getNombre();
    }
}
