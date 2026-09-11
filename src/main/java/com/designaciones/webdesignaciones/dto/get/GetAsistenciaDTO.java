package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.enums.EstadoAsistencia;
import com.designaciones.webdesignaciones.model.AsistenciaReunion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAsistenciaDTO {
    private Long idAsistencia;
    private GetArbitroDTO arbitro;
    private EstadoAsistencia estadoAsistencia;
    private String observacion;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;

    public GetAsistenciaDTO(AsistenciaReunion asistencia) {
        if (asistencia != null) {
            this.idAsistencia = asistencia.getIdAsistencia();
            this.arbitro = asistencia.getArbitro() != null ? new GetArbitroDTO(asistencia.getArbitro()) : null;
            this.estadoAsistencia = asistencia.getEstadoAsistencia();
            this.observacion = asistencia.getObservacion();
            this.disponibleSabado = asistencia.getDisponibleSabado();
            this.disponibleDomingo = asistencia.getDisponibleDomingo();
        }
    }
}
