package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "historial_estado_designacion")
public class HistorialEstadoDesignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorialEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idDesignacionH", nullable = false)
    private Designacion designacion;

    private Integer estadoAnterior;

    @Column(nullable = false)
    private Integer estadoNuevo;

    private String descripcionEstadoAnterior;

    private String descripcionEstadoNuevo;

    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    @Column(length = 500)
    private String motivo;

    private String usuario;
}
