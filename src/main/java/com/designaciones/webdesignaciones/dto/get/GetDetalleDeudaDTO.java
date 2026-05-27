package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.DeudaGasto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetDetalleDeudaDTO {
    private Long idDeuda;
    private Long idArbitro;
    private String arbitroNombre;
    private String arbitroApellido;
    private BigDecimal montoAsignado;
    private BigDecimal montoPagado;
    private String estado;

    public GetDetalleDeudaDTO(DeudaGasto deudaGasto) {
        this.idDeuda = deudaGasto.getIdDeuda();
        this.idArbitro = deudaGasto.getArbitro() != null ? deudaGasto.getArbitro().getIdArbitro() : null;
        this.arbitroNombre = deudaGasto.getArbitro() != null ? deudaGasto.getArbitro().getNombre() : null;
        this.arbitroApellido = deudaGasto.getArbitro() != null ? deudaGasto.getArbitro().getApellido() : null;
        this.montoAsignado = deudaGasto.getMontoAsignado();
        this.montoPagado = deudaGasto.getMontoPagado();
        this.estado = deudaGasto.getEstado();
    }
}

