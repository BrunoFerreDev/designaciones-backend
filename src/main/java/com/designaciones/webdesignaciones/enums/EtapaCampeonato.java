package com.designaciones.webdesignaciones.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum EtapaCampeonato {
    FECHA_NORMAL("FECHA_NORMAL"),
    FECHA_PICANTE("FECHA_PICANTE"),
    CLASIFICACION("CLASIFICACION"),
    CRUCES("CRUCES"),
    SEMIFINAL("SEMIFINAL"),
    FINAL("FINAL");

    private final String descripcion;

    EtapaCampeonato(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    /**
     * Método para recibir un String y devolver el Enum correspondiente.
     *
     * @JsonCreator le dice a Spring Boot que use este método al deserializar el JSON.
     */
    @JsonCreator
    public static EtapaCampeonato fromString(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }

        for (EtapaCampeonato etapa : EtapaCampeonato.values()) {
            if (etapa.getDescripcion().equalsIgnoreCase(texto.trim()) ||
                    etapa.name().equalsIgnoreCase(texto.trim())) {
                return etapa;
            }
        }

        // Si el texto no coincide con nada, lanzamos una excepción clara
        throw new IllegalArgumentException("Etapa de campeonato no válida: " + texto);
    }
}