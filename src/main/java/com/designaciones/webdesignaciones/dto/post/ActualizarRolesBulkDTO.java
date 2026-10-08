package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.enums.RolUsuario;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record ActualizarRolesBulkDTO(
        @NotNull(message = "El id de árbitro es requerido")
        Long idArbitro,

        @NotEmpty(message = "Debe proporcionar al menos un rol")
        Set<RolUsuario> roles
) {}
