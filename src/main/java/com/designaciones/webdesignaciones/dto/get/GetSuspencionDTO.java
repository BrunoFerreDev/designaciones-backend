package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Suspencion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GetSuspencionDTO {
    private Long idSuspencion;
    private LocalDateTime fechaIncidente, fechaFin;
    private LocalDateTime fechaRegistro;
    private int cantidadDias;
    private String motivo;
    // 1 = Llamado atencion, 2 = Suspencion
    private int tipoSuspencion;
    private GetArbitroDTO arbitro;
    private GetCanchaDTO cancha;

    public GetSuspencionDTO(Suspencion suspencion) {
        this.idSuspencion = suspencion.getIdSuspencion();
        this.fechaIncidente = suspencion.getFechaIncidente();
        this.fechaFin = suspencion.getFechaFin();
        this.fechaRegistro = suspencion.getFechaRegistro();
        this.cantidadDias = suspencion.getCantidadDias();
        this.motivo = suspencion.getMotivo();
        this.tipoSuspencion = suspencion.getTipoSuspencion();
        this.arbitro = new GetArbitroDTO(suspencion.getArbitro());
        this.cancha = new GetCanchaDTO(suspencion.getCancha());
    }
}
