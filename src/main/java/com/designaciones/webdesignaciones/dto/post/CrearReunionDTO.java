package com.designaciones.webdesignaciones.dto.post;

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
public class CrearReunionDTO {
    private LocalDateTime fecha;
    private String lugar;
    private String titulo;
    private String observaciones;

    @Builder.Default
    private Boolean inicializarAsistencia = true;

    @Builder.Default
    private List<TemaReunionDTO> temas = new ArrayList<>();
}
