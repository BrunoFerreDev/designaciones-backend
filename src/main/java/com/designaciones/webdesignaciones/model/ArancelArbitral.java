package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "tbl_aranceles")
public class ArancelArbitral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArancel;

    private String descripcion;

    private BigDecimal montoTotal;
    private LocalDate fechaVigencia;
    private int cantidadPartidos;
    private boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCanchaH")
    private Cancha cancha;
}
