package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "deudas_gasto")
public class DeudaGasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDeuda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_transaccion_gasto")
    private TransaccionGasto gastoOriginal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_arbitro")
    private Arbitro arbitro;

    @Column(precision = 12, scale = 2)
    private BigDecimal montoAsignado;

    @Column(precision = 12, scale = 2)
    private BigDecimal montoPagado = BigDecimal.ZERO;

    @Column(length = 20)
    private String estado = "PENDIENTE";
}
