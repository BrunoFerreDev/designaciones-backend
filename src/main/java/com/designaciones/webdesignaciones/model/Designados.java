package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "designados", indexes = {
        @Index(name = "idx_designados_designacion", columnList = "idDesignacionH"),
        @Index(name = "idx_designados_arbitro", columnList = "idArbitroH"),
        @Index(name = "idx_designados_arbitro_designacion", columnList = "idArbitroH, idDesignacionH")
})
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
    private Boolean participo;
}
