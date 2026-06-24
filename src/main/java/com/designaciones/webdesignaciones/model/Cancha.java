package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.Categoria;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cancha {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long idCancha;
    private String nombreCancha;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    private Boolean fueraDeJuego;
    private Boolean estado;

    @OneToMany(mappedBy = "cancha", fetch = FetchType.LAZY)
    private Set<Designacion> designaciones = new HashSet<>();
    @OneToMany(mappedBy = "cancha", fetch = FetchType.LAZY)
    private Set<Suspencion> suspenciones = new HashSet<>();
    @OneToMany(mappedBy = "cancha", fetch = FetchType.LAZY)
    private Set<ArancelArbitral> aranceles = new HashSet<>();

    public Cancha(String nombreCancha, Categoria categoria, Boolean fueraDeJuego, Boolean estado) {
        this.nombreCancha = nombreCancha;
        this.categoria = categoria;
        this.fueraDeJuego = fueraDeJuego;
        this.estado = estado;
    }
}

