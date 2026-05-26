package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
public class ConceptoGasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idConceptoGasto;
    @Column(nullable = false, length = 100)
    private String nombre;
    private String descripcion;

    @OneToMany(mappedBy = "conceptoGasto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TransaccionGasto> transaccionesGasto = new HashSet<>();

    public ConceptoGasto(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}
