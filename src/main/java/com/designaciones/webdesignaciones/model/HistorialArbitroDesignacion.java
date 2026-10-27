package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "historial_arbitro_designacion", indexes = {
        @Index(name = "idx_hist_arb_desig_lookup", columnList = "idDesignacionH, idArbitroH, activo"),
        @Index(name = "idx_hist_arb_desig_desig", columnList = "idDesignacionH")
})
public class HistorialArbitroDesignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorialArbitro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idDesignacionH", nullable = false)
    private Designacion designacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idArbitroH", nullable = false)
    private Arbitro arbitro;

    @Column(nullable = false)
    private LocalDateTime fechaAsignacion;

    private LocalDateTime fechaDesasignacion;

    private Boolean participo;

    @Column(length = 500)
    private String motivo;

    private Integer partidosDirigidos;

    private BigDecimal montoPercibido;

    @Builder.Default
    private Boolean activo = true;
}
