package com.designaciones.webdesignaciones.dto.get;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"username", "message", "jwt", "status", "tipo"})
public record AuthResponseDTO(String username, String message, String jwt, boolean status) {
}

