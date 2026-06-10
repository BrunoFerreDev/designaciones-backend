package com.designaciones.webdesignaciones.record;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;
import java.time.LocalDate;

@JsonPropertyOrder({"descripcion", "monto", "fechaVigencia", "cantidadPartidos", "idCancha"})
public record ArancelDTO(String descripcion, BigDecimal monto, LocalDate fechaVigencia, int cantidadPartidos,
                         Long idCancha) {
}
