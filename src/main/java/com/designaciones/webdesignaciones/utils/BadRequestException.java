package com.designaciones.webdesignaciones.utils;

public class BadRequestException extends ApiException {
    public BadRequestException(String message) {
        super(message);
    }
}
