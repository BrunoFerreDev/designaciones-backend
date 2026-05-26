package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Builder
public class Suspencion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSuspencion;

    private LocalDateTime fechaIncidente, fechaFin;
    private LocalDateTime fechaRegistro;

    private int cantidadDias;

    private String motivo;

    // 1 = Llamado atencion, 2 = Suspencion
    private int tipoSuspencion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idArbitroH")
    private Arbitro arbitro;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idCanchaH")
    private Cancha cancha;
}
