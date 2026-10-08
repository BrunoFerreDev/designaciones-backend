package com.designaciones.webdesignaciones.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.Set;

@JsonPropertyOrder({"username", "message", "jwt", "status", "roles", "idArbitro", "nombreCompleto"})
public record AuthResponse(
        String username,
        String message,
        String jwt,
        boolean status,
        Set<String> roles,
        Long idArbitro,
        String nombreCompleto
) {
    public AuthResponse(String username, String message, String jwt, boolean status) {
        this(username, message, jwt, status, Set.of(), null, null);
    }
}
