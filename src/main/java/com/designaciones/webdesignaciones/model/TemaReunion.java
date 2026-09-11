package com.designaciones.webdesignaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "tema_reunion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemaReunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reunion", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Reunion reunion;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Integer orden;

    private String urlMaterial;
}
