package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.HistorialArbitroDesignacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetHistorialArbitroDTO {
    private Long idHistorialArbitro;
    private Long idDesignacion;
    private GetArbitroDTO arbitro;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaDesasignacion;
    private Boolean participo;
    private String motivo;
    private Integer partidosDirigidos;
    private BigDecimal montoPercibido;
    private Boolean activo;

    public GetHistorialArbitroDTO(HistorialArbitroDesignacion historial) {
        this.idHistorialArbitro = historial.getIdHistorialArbitro();
        this.idDesignacion = historial.getDesignacion() != null ? historial.getDesignacion().getIdDesignacion() : null;
        this.arbitro = historial.getArbitro() != null ? new GetArbitroDTO(historial.getArbitro()) : null;
        this.fechaAsignacion = historial.getFechaAsignacion();
        this.fechaDesasignacion = historial.getFechaDesasignacion();
        this.participo = historial.getParticipo();
        this.motivo = historial.getMotivo();
        this.partidosDirigidos = historial.getPartidosDirigidos();
        this.montoPercibido = historial.getMontoPercibido();
        this.activo = historial.getActivo();
    }
}
