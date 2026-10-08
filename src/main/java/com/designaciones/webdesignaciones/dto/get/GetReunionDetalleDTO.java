package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.dto.post.TemaReunionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetReunionDetalleDTO {
    private Long idReunion;
    private LocalDateTime fecha;
    private String lugar;
    private String titulo;
    private String observaciones;
    private Boolean editable;

    private long totalPresentes;
    private long totalAusentes;
    private long totalJustificados;
    private long disponiblesSabado;
    private long disponiblesDomingo;

    @Builder.Default
    private List<TemaReunionDTO> temas = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> asistencias = new ArrayList<>();
}
