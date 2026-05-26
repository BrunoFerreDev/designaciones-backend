package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.post.CanchaDTO;
import com.designaciones.webdesignaciones.dto.get.GetCanchaDTO;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import com.designaciones.webdesignaciones.service.CanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CanchaServiceImpl implements CanchaService {
    private final CanchaRepository canchaRepository;

    @Override
    public Page<GetCanchaDTO> getAllCanchas(int page, int size) {
        return canchaRepository.findAll(PageRequest.of(page, size)).map(GetCanchaDTO::new);
    }

    @Override
    public Page<GetCanchaDTO> getActiveCanchas(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return canchaRepository.findByEstadoTrue(pageable).map(GetCanchaDTO::new);
    }

    @Override
    public void toggleCanchaEstado(Long idCancha) {
        Cancha cancha = canchaRepository.findById(idCancha).orElseThrow(() -> new RuntimeException("Cancha no encontrada"));
        cancha.setEstado(!cancha.getEstado());
        canchaRepository.save(cancha);
    }

    @Override
    public GetCanchaDTO createCancha(CanchaDTO canchaDTO) {
        Cancha cancha = Cancha.builder()
                .nombreCancha(canchaDTO.getNombreCancha())
                .categoria(canchaDTO.getCategoria())
                .fueraDeJuego(canchaDTO.getFueraDeJuego())
                .estado(true) // Por defecto, la nueva cancha estará activa
                .build();
        return new GetCanchaDTO(canchaRepository.save(cancha));
    }
}
