package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.EstadoAsistencia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "asistencia_reunion", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_reunion", "id_arbitro"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaReunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAsistencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reunion", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Reunion reunion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_arbitro", nullable = false)
    private Arbitro arbitro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAsistencia estadoAsistencia;

    private String observacion;

    @Builder.Default
    private Boolean disponibleSabado = false;

    @Builder.Default
    private Boolean disponibleDomingo = false;
}
