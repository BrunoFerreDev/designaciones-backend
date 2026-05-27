package com.designaciones.webdesignaciones.model.subModel;

import com.designaciones.webdesignaciones.model.ConceptoGasto;
import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.Transaccion;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "transacciones_gasto")
@PrimaryKeyJoinColumn(name = "idTransaccion")
public class TransaccionGasto extends Transaccion {

    private Boolean requiereRecupero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concepto_gasto_id_h", nullable = false)
    private ConceptoGasto conceptoGasto;


    @OneToMany(mappedBy = "gastoOriginal", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<DeudaGasto> deudasDivididas = new HashSet<>();

    public void addDeuda(DeudaGasto deuda) {
        deuda.setGastoOriginal(this);
        deudasDivididas.add(deuda);
    }
}
