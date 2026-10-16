package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.HistorialEstadoDesignacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetHistorialEstadoDTO {
    private Long idHistorialEstado;
    private Long idDesignacion;
    private Integer estadoAnterior;
    private Integer estadoNuevo;
    private String descripcionEstadoAnterior;
    private String descripcionEstadoNuevo;
    private LocalDateTime fechaCambio;
    private String motivo;
    private String usuario;

    public GetHistorialEstadoDTO(HistorialEstadoDesignacion historial) {
        this.idHistorialEstado = historial.getIdHistorialEstado();
        this.idDesignacion = historial.getDesignacion() != null ? historial.getDesignacion().getIdDesignacion() : null;
        this.estadoAnterior = historial.getEstadoAnterior();
        this.estadoNuevo = historial.getEstadoNuevo();
        this.descripcionEstadoAnterior = historial.getDescripcionEstadoAnterior();
        this.descripcionEstadoNuevo = historial.getDescripcionEstadoNuevo();
        this.fechaCambio = historial.getFechaCambio();
        this.motivo = historial.getMotivo();
        this.usuario = historial.getUsuario();
    }
}
