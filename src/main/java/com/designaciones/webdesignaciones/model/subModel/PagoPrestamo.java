package com.designaciones.webdesignaciones.model.subModel;

import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.Transaccion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pagos_prestamo")
@PrimaryKeyJoinColumn(name = "idTransaccion")
public class PagoPrestamo extends Transaccion {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPrestamoH")
    private Prestamo prestamo;
}
