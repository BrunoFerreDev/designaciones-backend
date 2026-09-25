package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetCajaDTO;
import com.designaciones.webdesignaciones.repository.CajaRepository;
import com.designaciones.webdesignaciones.service.CajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Primary
@Service
@RequiredArgsConstructor
public class CajaServiceImpl implements CajaService {

    private final CajaRepository cajaRepository;

    @Override
    @Transactional(readOnly = true)
    public GetCajaDTO traerCajaActual() {
        int anioActual = LocalDate.now().getYear();
        return new GetCajaDTO(cajaRepository.findByActivoAndAnio(true, anioActual)
                .orElseThrow(() -> new RuntimeException("Caja actual no encontrada para el año: " + anioActual)));
    }
}
