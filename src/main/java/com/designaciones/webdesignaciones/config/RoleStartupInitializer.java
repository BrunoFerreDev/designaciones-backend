package com.designaciones.webdesignaciones.config;

import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoleStartupInitializer implements ApplicationRunner {

    private final ArbitroRepository arbitroRepository;

    @Value("${JWT_PHONE:}")
    private String phone;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("[ROLE INIT] Verificando roles iniciales de árbitros...");
        List<Arbitro> todos = arbitroRepository.findAll();

        for (Arbitro a : todos) {
            boolean cambiado = false;
            if (a.getRoles() == null || a.getRoles().isEmpty()) {
                a.agregarRol(RolUsuario.ARBITRO);
                cambiado = true;
            }

            if (phone != null && !phone.isBlank() && a.getWhatsapp() != null && a.getWhatsapp().equalsIgnoreCase(phone.trim())) {
                if (!a.tieneRol(RolUsuario.SUPERUSER)) {
                    a.agregarRol(RolUsuario.SUPERUSER);
                    cambiado = true;
                    log.info("[ROLE INIT] Asignado rol SUPERUSER a arbitro con whatsapp {}", a.getWhatsapp());
                }
            }

            if (cambiado) {
                arbitroRepository.save(a);
            }
        }
        log.info("[ROLE INIT] Inicialización de roles completada con éxito.");
    }
}
