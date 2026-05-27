package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetDetalleTransaccionGastoDTO {
    private Long idTransaccion;
    private String tipo;
    private BigDecimal monto;
    private LocalDate fechaTransaccion;
    private LocalDateTime fechaRegistro;
    private String descripcion;
    private Boolean requiereRecupero;
    private Integer concepto_gasto_id;
    private String conceptoGastoNombre;
    private Long idCaja;
    private List<GetDetalleDeudaDTO> deudasDivididas;

    public GetDetalleTransaccionGastoDTO(TransaccionGasto transaccionGasto) {
        this.idTransaccion = transaccionGasto.getIdTransaccion();
        this.tipo = transaccionGasto.getTipo();
        this.monto = transaccionGasto.getMonto();
        this.fechaTransaccion = transaccionGasto.getFechaTransaccion();
        this.fechaRegistro = transaccionGasto.getFechaRegistro();
        this.descripcion = transaccionGasto.getDescripcion();
        this.requiereRecupero = transaccionGasto.getRequiereRecupero();
        this.concepto_gasto_id = transaccionGasto.getConceptoGasto() != null ?
                transaccionGasto.getConceptoGasto().getIdConceptoGasto() : null;
        this.conceptoGastoNombre = transaccionGasto.getConceptoGasto() != null ?
                transaccionGasto.getConceptoGasto().getNombre() : null;
        this.idCaja = transaccionGasto.getCaja() != null ?
                transaccionGasto.getCaja().getIdCaja() : null;
        this.deudasDivididas = transaccionGasto.getDeudasDivididas() != null ?
                transaccionGasto.getDeudasDivididas().stream()
                    .map(GetDetalleDeudaDTO::new)
                    .toList() : List.of();
    }
}


