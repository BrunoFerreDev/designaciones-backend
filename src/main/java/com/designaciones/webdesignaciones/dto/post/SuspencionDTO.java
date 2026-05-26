package com.designaciones.webdesignaciones.dto.post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class SuspencionDTO {

    private LocalDateTime fechaIncidente;
    private int cantidadDias;
    private String motivo;
    // 1 = Llamado atencion, 2 = Suspencion
    private int tipoSuspencion;
    private Long arbitro, cancha;

}
