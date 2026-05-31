package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDesignacion;
    private LocalDateTime fecha;
    private Integer cantidadPartidos;
    @Enumerated(EnumType.STRING)
    private EtapaCampeonato etapaCampeonato;
    private int estadoDesignacion; // 0: Pendiente a completar, 1: Completa, 2: Jornada finalizada, 3: Jornada cancelada

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idCanchaH")
    private Cancha cancha;
}
