package com.designaciones.webdesignaciones.security;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final ArbitroRepository arbitroRepository;

    public boolean esMismoArbitro(Authentication authentication, Long idArbitro) {
        if (authentication == null || !authentication.isAuthenticated() || idArbitro == null) {
            return false;
        }
        String whatsapp = authentication.getName();
        return arbitroRepository.findById(idArbitro)
                .map(arbitro -> arbitro.getWhatsapp() != null && arbitro.getWhatsapp().equalsIgnoreCase(whatsapp))
                .orElse(false);
    }

    public boolean esMismoArbitroPorWhatsapp(Authentication authentication, String whatsapp) {
        if (authentication == null || !authentication.isAuthenticated() || whatsapp == null) {
            return false;
        }
        return whatsapp.equalsIgnoreCase(authentication.getName());
    }

    public Arbitro getArbitroAutenticado(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return arbitroRepository.findByWhatsapp(authentication.getName());
    }
}
