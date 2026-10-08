package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.enums.EstadoAsistencia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemAsistenciaDTO {
    private Long idArbitro;
    private EstadoAsistencia estadoAsistencia;
    private String observacion;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
}
