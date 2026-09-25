package com.designaciones.webdesignaciones.enums;

public enum RolUsuario {
    SUPERUSER,
    PRESIDENTE,
    SECRETARIO,
    DESIGNADOR,
    ARBITRO;

    public static RolUsuario fromString(String rol) {
        if (rol == null || rol.isBlank()) {
            return ARBITRO;
        }
        try {
            return RolUsuario.valueOf(rol.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ARBITRO;
        }
    }
}
