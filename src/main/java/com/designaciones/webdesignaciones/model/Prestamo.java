package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPrestamo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arbitro_id", nullable = false)
    private Arbitro arbitro;

    @Column(name = "monto_solicitado", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoSolicitado;

    @Column(name = "monto_devuelto", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoDevuelto = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud = LocalDate.now();

    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PagoPrestamo> pagos = new HashSet<>();
}
