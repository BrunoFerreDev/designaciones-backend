package com.designaciones.webdesignaciones.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CategoriaArbitro {
    ELITE("ELITE"),
    AVANZADO("AVANZADO"),
    INTERMEDIO("INTERMEDIO"),
    INTERMEDIO_BAJO("INTERMEDIO_BAJO"),
    INICIAL("INICIAL"),
    EN_FORMACION("FORMACION");

    private final String descripcion;

    CategoriaArbitro(String descripcion) {
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
    public static CategoriaArbitro fromString(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }

        for (CategoriaArbitro cat : CategoriaArbitro.values()) {
            if (cat.getDescripcion().equalsIgnoreCase(texto.trim()) ||
                    cat.name().equalsIgnoreCase(texto.trim())) {
                return cat;
            }
        }

        // Si el texto no coincide con nada, lanzamos una excepción clara
        throw new IllegalArgumentException("Categoría de árbitro no válida: " + texto);
    }
}
