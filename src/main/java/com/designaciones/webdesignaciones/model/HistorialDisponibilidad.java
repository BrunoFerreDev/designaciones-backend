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
public class HistorialDisponibilidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorialDisponibilidad;
    private LocalDateTime fechaHora;
    private String motivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idArbitroH")
    private Arbitro arbitro;

}
