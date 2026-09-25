package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.post.CambiarContraseniaDTO;

public interface ArbitroCredentialService {
    void cambiarContrasenia(String whatsapp, CambiarContraseniaDTO dto);
    void resetearContrasenia(Long idArbitro);
}
