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
@Table(name = "designacion", indexes = {
        @Index(name = "idx_designacion_fecha", columnList = "fecha"),
        @Index(name = "idx_designacion_cancha_fecha_estado", columnList = "idCanchaH, fecha, estado_designacion"),
        @Index(name = "idx_designacion_estado_fecha", columnList = "estado_designacion, fecha")
})
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
    private int estadoDesignacion; // 0: Pendiente a completar, 1: Aceptada, 2: Jornada finalizada, 3: Jornada cancelada, 4: Suspendida en juego, 5: Suspendida / Por reprogramar
    private String detalleExtra;
    private Boolean editable;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idCanchaH")
    private Cancha cancha;
}
