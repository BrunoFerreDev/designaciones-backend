package com.designaciones.webdesignaciones.dto.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrarAsistenciaBatchDTO {
    @Builder.Default
    private List<ItemAsistenciaDTO> asistencias = new ArrayList<>();

    @Builder.Default
    private Boolean sincronizarDisponibilidad = true;
}
