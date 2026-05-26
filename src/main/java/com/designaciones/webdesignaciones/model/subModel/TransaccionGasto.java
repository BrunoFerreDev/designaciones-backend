package com.designaciones.webdesignaciones.model.subModel;

import com.designaciones.webdesignaciones.model.ConceptoGasto;
import com.designaciones.webdesignaciones.model.Transaccion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "transacciones_gasto")
@PrimaryKeyJoinColumn(name = "idTransaccion")
public class TransaccionGasto extends Transaccion {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concepto_gasto_id_h", nullable = false)
    private ConceptoGasto conceptoGasto;
}
