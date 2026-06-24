package com.designaciones.webdesignaciones.record;

import jakarta.validation.constraints.NotBlank;

public record AuthLogin(@NotBlank String whatsapp,
                        @NotBlank String contrasenia) {
}
