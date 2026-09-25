package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.enums.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarRolesDTO {
    private Set<RolUsuario> roles;
}
