package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reunion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReunion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    private String lugar;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Builder.Default
    private Boolean editable = true;

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<TemaReunion> temas = new ArrayList<>();

    @OneToMany(mappedBy = "reunion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<AsistenciaReunion> asistencias = new ArrayList<>();
}
