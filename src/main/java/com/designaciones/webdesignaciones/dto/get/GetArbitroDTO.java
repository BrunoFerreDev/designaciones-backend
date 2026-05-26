package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Arbitro;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class GetArbitroDTO {
    private Long idArbitro;
    private String nombre;
    private String apellido;
    private String whatsapp;
    private Boolean estado;
    private String talleShort;
    private String talleCamiseta;
    private String categoria;

    public GetArbitroDTO(Arbitro arbitro) {
        this.idArbitro = arbitro.getIdArbitro();
        this.nombre = arbitro.getNombre();
        this.apellido = arbitro.getApellido();
        this.whatsapp = arbitro.getWhatsapp();
        this.estado = arbitro.getDisponibilidad();
        this.talleShort = arbitro.getTalleShort();
        this.talleCamiseta = arbitro.getTalleCamiseta();
        this.categoria = arbitro.getCategoria() != null ? arbitro.getCategoria().name() : null;
    }
}
