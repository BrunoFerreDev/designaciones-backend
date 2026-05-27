package com.designaciones.webdesignaciones.dto.get;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Prestamo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetPrestamoDTO {
    private Long idPrestamo;
    private GetArbitroDTO arbitro;
    private BigDecimal montoSolicitado;
    private BigDecimal montoDevuelto;
    private String estado;
    private LocalDate fechaSolicitud;

    public GetPrestamoDTO(Prestamo prestamo) {
        this.idPrestamo = prestamo.getIdPrestamo();
        this.arbitro = new GetArbitroDTO(prestamo.getArbitro());
        this.montoSolicitado = prestamo.getMontoSolicitado();
        this.montoDevuelto = prestamo.getMontoDevuelto();
        this.estado = prestamo.getEstado();
        this.fechaSolicitud = prestamo.getFechaSolicitud();
    }

}
