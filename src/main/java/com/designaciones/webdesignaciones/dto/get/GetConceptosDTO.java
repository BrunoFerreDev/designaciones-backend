package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.ConceptoGasto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class GetConceptosDTO {
    private Integer idConcepto;
    private String nombre;
    private String descripcion;

    public GetConceptosDTO(ConceptoGasto conceptoGasto) {
        this.idConcepto = conceptoGasto.getIdConceptoGasto();
        this.nombre = conceptoGasto.getNombre();
        this.descripcion = conceptoGasto.getDescripcion();
    }
}
