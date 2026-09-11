package com.designaciones.webdesignaciones.dto.post;

import com.designaciones.webdesignaciones.model.TemaReunion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemaReunionDTO {
    private Long idTema;
    private String titulo;
    private String descripcion;
    private Integer orden;
    private String urlMaterial;

    public TemaReunionDTO(TemaReunion tema) {
        if (tema != null) {
            this.idTema = tema.getIdTema();
            this.titulo = tema.getTitulo();
            this.descripcion = tema.getDescripcion();
            this.orden = tema.getOrden();
            this.urlMaterial = tema.getUrlMaterial();
        }
    }
}
