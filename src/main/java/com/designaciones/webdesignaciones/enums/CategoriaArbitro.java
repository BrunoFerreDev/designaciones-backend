package com.designaciones.webdesignaciones.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CategoriaArbitro {
    AVANZADO("AVANZADO"),
    INTERMEDIO("INTERMEDIO"),
    PRINCIPAL_1("PRINCIPAL_1"),
    PRINCIPAL_2("PRINCIPAL_2"),
    PRINCIPAL_3("PRINCIPAL_3"),
    PRINCIPAL_4("PRINCIPAL_4"),
    ASISTENTE("ASISTENTE"),
    INICIAL("INICIAL");

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
