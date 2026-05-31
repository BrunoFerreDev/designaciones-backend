package com.designaciones.webdesignaciones.dto.post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArbitroDisponibilidadDTO {
    private Boolean estado;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
}
