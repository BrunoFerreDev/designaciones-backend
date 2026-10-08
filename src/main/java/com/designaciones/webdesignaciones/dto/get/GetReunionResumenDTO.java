package com.designaciones.webdesignaciones.dto.get;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetReunionResumenDTO {
    private Long idReunion;
    private LocalDateTime fecha;
    private String lugar;
    private String titulo;
    private int cantidadTemas;
    private long totalPresentes;
    private long totalAusentes;
    private long totalJustificados;
    private long disponiblesSabado;
    private long disponiblesDomingo;
    private Boolean editable;
}
