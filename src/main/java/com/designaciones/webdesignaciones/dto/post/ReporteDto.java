package com.designaciones.webdesignaciones.dto.post;

public class ReporteDto {
    private final byte[] pdfBytes;
    private final String nombreConcepto;
    private final String fecha;

    public ReporteDto(byte[] pdfBytes, String nombreConcepto, String fecha) {
        this.pdfBytes = pdfBytes;
        this.nombreConcepto = nombreConcepto;
        this.fecha = fecha;
    }

    public byte[] getPdfBytes() {
        return pdfBytes;
    }

    public String getNombreConcepto() {
        return nombreConcepto;
    }

    public String getFecha() {
        return fecha;
    }
}
