package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.SuspencionDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Suspencion;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.service.SuspencionService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SuspencionServiceImpl implements SuspencionService {
    private final SuspencionRepository suspencionRepository;
    private final ArbitroRepository arbitroRepository;
    private final CanchaRepository canchaRepository;

    @Override
    public Page<GetSuspencionDTO> traerSuspenciones(Long idArbitro, int page, int size) {
        Arbitro arbitro = getArbitro(idArbitro);
        Page<Suspencion> suspenciones = suspencionRepository.findByArbitro(arbitro, PageRequest.of(page, size));
        return suspenciones.map(GetSuspencionDTO::new);
    }

    @Override
    public GetSuspencionDTO cargarSuspencion(SuspencionDTO suspencionDTO) {
        Suspencion suspencion = Suspencion.builder().arbitro(getArbitro(suspencionDTO.getArbitro()))
                .cancha(getCancha(suspencionDTO.getCancha()))
                .fechaIncidente(suspencionDTO.getFechaIncidente())
                .fechaFin(suspencionDTO.getFechaIncidente().plusDays(suspencionDTO.getCantidadDias()))
                .fechaRegistro(LocalDateTime.now())
                .cantidadDias(suspencionDTO.getCantidadDias())
                .motivo(suspencionDTO.getMotivo())
                .tipoSuspencion(suspencionDTO.getTipoSuspencion())
                .build();
        suspencionRepository.save(suspencion);
        return new GetSuspencionDTO(suspencion);
    }

    @Override
    public Page<GetSuspencionDTO> getAllSuspenciones(int page, int size) {
        return suspencionRepository.findAll(PageRequest.of(page, size)).map(GetSuspencionDTO::new);
    }

    @Override
    public String deleteSuspencion(Long idSuspencion) {
        try {
            suspencionRepository.deleteById(idSuspencion);
            return "Suspencion con id " + idSuspencion + " eliminada correctamente";
        } catch (Exception e) {
            throw new BadRequestException("Error al eliminar la suspencion");
        }
    }

    private Arbitro getArbitro(Long idArbitro) {
        return arbitroRepository.findById(idArbitro).orElseThrow(() -> new RuntimeException("Arbitro no encontrado"));
    }

    private Cancha getCancha(Long idCancha) {
        return canchaRepository.findById(idCancha).orElseThrow(() -> new RuntimeException("Cancha no encontrada"));
    }
}
