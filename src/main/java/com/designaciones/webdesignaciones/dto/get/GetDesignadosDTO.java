package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Designados;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GetDesignadosDTO {
    private Long idDesignados;
    private GetArbitroDTO arbitro;
    private Integer partidosDirigidos;
    private BigDecimal montoPercibido;

    public GetDesignadosDTO(Designados designados) {
        this.idDesignados = designados.getIdDesignados();
        this.arbitro = new GetArbitroDTO(designados.getArbitro());
        this.partidosDirigidos = designados.getPartidosDirigidos();
        this.montoPercibido = designados.getMontoPercibido();
    }
}
