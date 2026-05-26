package com.designaciones.webdesignaciones.utils;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class ApiError {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private Map<String, String> fieldErrors;

    public ApiError(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(int status, String message, String path) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(int status, String message, String path, Map<String, String> fieldErrors) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.fieldErrors = fieldErrors;
        this.timestamp = LocalDateTime.now();
    }
}
