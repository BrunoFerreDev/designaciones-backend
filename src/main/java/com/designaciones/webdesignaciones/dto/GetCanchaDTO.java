package com.designaciones.webdesignaciones.dto;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.model.Cancha;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class GetCanchaDTO {
    private Long idCancha;
    private String nombreCancha;
    private Categoria categoria;
    private Boolean fueraDeJuego;
    private Boolean estado;

    public GetCanchaDTO(Cancha cancha) {
        this.idCancha = cancha.getIdCancha();
        this.nombreCancha = cancha.getNombreCancha();
        this.categoria = cancha.getCategoria();
        this.fueraDeJuego = cancha.getFueraDeJuego();
        this.estado = cancha.getEstado();
    }
}
