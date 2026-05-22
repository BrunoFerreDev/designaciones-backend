package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDesignados;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idDesignacionH")
    private Designacion designacion;

    @Enumerated(EnumType.STRING)
    private CategoriaArbitro categoriaArbitro;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idArbitroH")
    private Arbitro arbitro;

    private Integer partidosDirigidos;
    private BigDecimal montoPercibido;

}
