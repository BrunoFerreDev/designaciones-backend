package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.service.ArbitroService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArbitroServiceImpl implements ArbitroService {
    private final ArbitroRepository arbitroRepository;

    @Override
    public GetArbitroDTO createArbitro(ArbitroDTO arbitroDTO) {
        Arbitro arbitro = Arbitro.builder()
                .nombre(arbitroDTO.getNombre())
                .apellido(arbitroDTO.getApellido())
                .whatsapp(arbitroDTO.getWhatsapp())
                .categoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()))
                .talleShort(arbitroDTO.getTalleShort())
                .talleCamiseta(arbitroDTO.getTalleCamiseta())
                .disponibilidad(arbitroDTO.getEstado() != null ? arbitroDTO.getEstado() : true)
                .estadoSistema(true)
                .build();
        arbitroRepository.save(arbitro);
        return new GetArbitroDTO(arbitro);
    }

    @Override
    public Page<GetArbitroDTO> getAllArbitros(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findByEstadoSistemaTrue(pageable).map(GetArbitroDTO::new);
    }

    @Override
    public Page<GetArbitroDTO> traerDisponibles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findByDisponibilidadTrueAndEstadoSistemaTrue(pageable).map(GetArbitroDTO::new);
    }

    @Override
    public GetArbitroDTO updateArbitroDisponibilidad(Long idArbitro) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new RuntimeException("Arbitro no encontrado"));
        arbitro.setDisponibilidad(!arbitro.getDisponibilidad());
        arbitroRepository.save(arbitro);
        return new GetArbitroDTO(arbitro);
    }

    @Override
    public GetArbitroDTO updateArbitro(Long idArbitro, ArbitroDTO arbitroDTO) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new RuntimeException("Arbitro no encontrado"));
        arbitro.setNombre(arbitroDTO.getNombre());
        arbitro.setApellido(arbitroDTO.getApellido());
        arbitro.setWhatsapp(arbitroDTO.getWhatsapp());
        arbitro.setDisponibilidad(arbitroDTO.getEstado() != null ? arbitroDTO.getEstado() : arbitro.getDisponibilidad());
        arbitro.setTalleShort(arbitroDTO.getTalleShort());
        arbitro.setTalleCamiseta(arbitroDTO.getTalleCamiseta());
        arbitro.setCategoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()));
        arbitroRepository.save(arbitro);
        return new GetArbitroDTO(arbitro);
    }

    @Override
    public String deleteArbitro(Long idArbitro) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new RuntimeException("Arbitro no encontrado"));
        arbitro.setEstadoSistema(false);
        arbitro.setDisponibilidad(false);
        arbitroRepository.save(arbitro);
        return "Arbitro con id " + idArbitro + " eliminado correctamente";
    }

    @Override
    public String modificarDisponibilidadTotal() {
        for (Arbitro arbitro : arbitroRepository.findAll()) {
            arbitro.setDisponibilidad(false);
            arbitroRepository.save(arbitro);
        }
        return "Disponibilidad de todos los arbitros actualizada a true";
    }

    @Override
    public Page<GetArbitroDTO> traerTodos(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return arbitroRepository.findAll(pageable).map(GetArbitroDTO::new);
    }
}
