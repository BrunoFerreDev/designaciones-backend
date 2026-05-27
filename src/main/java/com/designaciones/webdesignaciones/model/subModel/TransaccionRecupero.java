package com.designaciones.webdesignaciones.model.subModel;

import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.Transaccion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "transacciones_recupero")
@PrimaryKeyJoinColumn(name = "idTransaccion")
public class TransaccionRecupero extends Transaccion {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_deuda_gasto", nullable = false)
    private DeudaGasto deudaAsociada;
}
