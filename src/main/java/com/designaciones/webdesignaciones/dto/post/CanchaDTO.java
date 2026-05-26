package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.enums.Categoria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CanchaDTO {
    private String nombreCancha;
    private Categoria categoria;
    private Boolean fueraDeJuego;
    private Boolean estado;

}
