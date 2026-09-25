package com.designaciones.webdesignaciones.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarContraseniaDTO(
        @NotBlank(message = "La contraseña actual es requerida")
        String contraseniaActual,

        @NotBlank(message = "La nueva contraseña es requerida")
        @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
        String nuevaContrasenia
) {}
