package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class Caja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCaja;

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: "Caja Chica Efectivo", "Mercado Pago"

    // AQUÍ ESTÁ LA PLATA QUE TENÉS ACTUALMENTE
    @Column(name = "saldo_actual", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoActual = BigDecimal.ZERO;

    private int anio;

    private Boolean activo;

    @OneToMany(mappedBy = "caja", cascade = CascadeType.ALL)
    private List<Transaccion> transacciones;
}
