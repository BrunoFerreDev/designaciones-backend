package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Caja;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetCajaDTO {
    private Long idCaja;

    private String nombre;

    private BigDecimal saldoActual;
    private int anio;
    private Boolean activo;

    public GetCajaDTO(Caja caja) {
        this.idCaja = caja.getIdCaja();
        this.nombre = caja.getNombre();
        this.saldoActual = caja.getSaldoActual();
        this.anio = caja.getAnio();
        this.activo = caja.getActivo();
    }
}
