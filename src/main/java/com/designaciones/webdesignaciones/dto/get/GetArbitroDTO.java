package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Arbitro;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class GetArbitroDTO {
    private Long idArbitro;
    private String nombre;
    private String apellido;
    private String whatsapp;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
    private String talleShort;
    private String talleCamiseta;
    private String categoria;
    private Boolean tieneAuto;
    private Boolean estadoSistema;

    public GetArbitroDTO(Arbitro arbitro) {
        this.idArbitro = arbitro.getIdArbitro();
        this.nombre = arbitro.getNombre();
        this.apellido = arbitro.getApellido();
        this.whatsapp = arbitro.getWhatsapp();
        this.disponibleSabado = arbitro.getDisponibleSabado();
        this.disponibleDomingo = arbitro.getDisponibleDomingo();
        this.talleShort = arbitro.getTalleShort();
        this.talleCamiseta = arbitro.getTalleCamiseta();
        this.categoria = arbitro.getCategoria() != null ? arbitro.getCategoria().name() : null;
        this.tieneAuto = arbitro.getTieneAuto();
        this.estadoSistema = arbitro.getEstadoSistema();
    }


}
