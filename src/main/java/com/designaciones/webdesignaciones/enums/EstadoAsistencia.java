package com.designaciones.webdesignaciones.enums;

public enum EstadoAsistencia {
    PRESENTE,
    AUSENTE,
    JUSTIFICADO;

    public static EstadoAsistencia fromString(String valor) {
        if (valor == null) return null;
        for (EstadoAsistencia estado : EstadoAsistencia.values()) {
            if (estado.name().equalsIgnoreCase(valor.trim())) {
                return estado;
            }
        }
        return AUSENTE;
    }
}
