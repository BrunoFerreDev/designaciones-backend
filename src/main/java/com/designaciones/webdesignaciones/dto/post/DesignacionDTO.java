package com.designaciones.webdesignaciones.dto.post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DesignacionDTO {
    private Long idCancha;
    private LocalDateTime fecha;
    private Integer cantidadPartidos;
    private String etapaCampeonato;
}
