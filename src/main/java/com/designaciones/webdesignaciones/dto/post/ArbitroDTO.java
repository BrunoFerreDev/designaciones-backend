package com.designaciones.webdesignaciones.dto.post;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ArbitroDTO {
    private String nombre;
    private String apellido;
    private String whatsapp;
    private Boolean estado;
    private String talleShort, talleCamiseta;
    private String categoria;
}
