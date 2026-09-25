package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.post.CambiarContraseniaDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.service.ArbitroCredentialService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArbitroCredentialServiceImpl implements ArbitroCredentialService {

    private final ArbitroRepository arbitroRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void cambiarContrasenia(String whatsapp, CambiarContraseniaDTO dto) {
        Arbitro arbitro = arbitroRepository.findByWhatsapp(whatsapp);
        if (arbitro == null) {
            throw new NotFoundException("Usuario no encontrado");
        }

        if (!passwordEncoder.matches(dto.contraseniaActual(), arbitro.getContrasenia())) {
            throw new BadRequestException("La contraseña actual no es correcta");
        }

        if (dto.nuevaContrasenia() == null || dto.nuevaContrasenia().trim().length() < 6) {
            throw new BadRequestException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        if (passwordEncoder.matches(dto.nuevaContrasenia(), arbitro.getContrasenia())) {
            throw new BadRequestException("La nueva contraseña no puede ser idéntica a la actual");
        }

        arbitro.setContrasenia(passwordEncoder.encode(dto.nuevaContrasenia().trim()));
        arbitroRepository.save(arbitro);
        log.info("Contraseña actualizada exitosamente para arbitro con whatsapp {}", whatsapp);
    }

    @Override
    @Transactional
    public void resetearContrasenia(Long idArbitro) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado con id " + idArbitro));

        String clavePorDefecto = arbitro.getApellido() + arbitro.getNombre();
        arbitro.setContrasenia(passwordEncoder.encode(clavePorDefecto));
        arbitroRepository.save(arbitro);
        log.info("Contraseña restablecida por defecto (apellido+nombre) para arbitro con id {}", idArbitro);
    }
}
