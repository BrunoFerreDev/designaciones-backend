package com.designaciones.webdesignaciones.dto.post;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GastoDTO {
    private String tipo; // "INGRESO" o "EGRESO"
    private BigDecimal monto;
    private LocalDateTime fecha;
    private String descripcion;
    private Boolean requiereRecupero;
    private Long concepto;
}
