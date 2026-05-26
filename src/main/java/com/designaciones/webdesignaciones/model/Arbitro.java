package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import jakarta.persistence.*;
import jdk.jfr.DataAmount;
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
public class Arbitro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArbitro;
    private String nombre;
    private String apellido;
    private String whatsapp;
    private Boolean disponibilidad;
    private Boolean estadoSistema;
    private String talleShort, talleCamiseta;
    @Enumerated(EnumType.STRING)
    private CategoriaArbitro categoria;

    @OneToMany(mappedBy = "arbitro", fetch = FetchType.LAZY)
    private Set<Designados> designaciones = new HashSet<>();

    @OneToMany(mappedBy = "arbitro", fetch = FetchType.LAZY)
    private Set<HistorialDisponibilidad> historialDisponibilidad = new HashSet<>();

    @OneToMany(mappedBy = "arbitro", fetch = FetchType.LAZY)
    private Set<Suspencion> suspenciones = new HashSet<>();

    public Arbitro(String apellido, String nombre, String talleCamiseta, String talleShort) {
        this.apellido = apellido;
        this.nombre = nombre;
        this.talleCamiseta = talleCamiseta;
        this.talleShort = talleShort;
        this.estadoSistema = true;
        this.disponibilidad = false;
    }
}
