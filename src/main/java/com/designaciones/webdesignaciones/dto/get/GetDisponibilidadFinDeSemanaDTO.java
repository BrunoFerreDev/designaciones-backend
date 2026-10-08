package com.designaciones.webdesignaciones.dto.get;

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
public class GetDisponibilidadFinDeSemanaDTO {
    private Long idReunion;
    private LocalDateTime fechaReunion;
    private String tituloReunion;

    private long totalEvaluados;
    private long totalDisponiblesSabado;
    private long totalDisponiblesDomingo;
    private long totalDisponiblesAmbosDias;
    private long totalNoDisponibles;

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesSabado = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesDomingo = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> disponiblesAmbosDias = new ArrayList<>();

    @Builder.Default
    private List<GetAsistenciaDTO> noDisponibles = new ArrayList<>();
}
