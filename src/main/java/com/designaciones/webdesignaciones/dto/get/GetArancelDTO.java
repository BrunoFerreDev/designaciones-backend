package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.ArancelArbitral;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GetArancelDTO {
    private Long idArancel;
    private String descripcion;
    private BigDecimal montoTotal;
    private LocalDate fechaVigencia;
    private int cantidadPartidos;
    private boolean activo;
    private GetCanchaDTO cancha;

    public GetArancelDTO(ArancelArbitral arancelArbitral) {
        this.idArancel = arancelArbitral.getIdArancel();
        this.descripcion = arancelArbitral.getDescripcion();
        this.montoTotal = arancelArbitral.getMontoTotal();
        this.fechaVigencia = arancelArbitral.getFechaVigencia();
        this.cantidadPartidos = arancelArbitral.getCantidadPartidos();
        this.activo = arancelArbitral.isActivo();
        this.cancha = new GetCanchaDTO(arancelArbitral.getCancha());
    }
}
