package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArbitroServiceImpl implements ArbitroService {
    private final ArbitroRepository arbitroRepository;

    @Override
    @Transactional
    public GetArbitroDTO createArbitro(ArbitroDTO arbitroDTO) {
        Arbitro arbitro = Arbitro.builder()
                .nombre(arbitroDTO.getNombre())
                .apellido(arbitroDTO.getApellido())
                .whatsapp(arbitroDTO.getWhatsapp())
                .categoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()))
                .talleShort(arbitroDTO.getTalleShort())
                .talleCamiseta(arbitroDTO.getTalleCamiseta())
                .disponibilidad(arbitroDTO.getEstado() != null ? arbitroDTO.getEstado() : true)
                .disponibleSabado(arbitroDTO.getDisponibleSabado() != null ? arbitroDTO.getDisponibleSabado() : false)
                .disponibleDomingo(arbitroDTO.getDisponibleDomingo() != null ? arbitroDTO.getDisponibleDomingo() : false)
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
    @Transactional
    public GetArbitroDTO updateArbitroDisponibilidad(Long idArbitro, ArbitroDisponibilidadDTO dto) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro).orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
        if (dto.getEstado() != null) arbitro.setDisponibilidad(dto.getEstado());
        if (dto.getDisponibleSabado() != null) arbitro.setDisponibleSabado(dto.getDisponibleSabado());
        if (dto.getDisponibleDomingo() != null) arbitro.setDisponibleDomingo(dto.getDisponibleDomingo());
        arbitroRepository.save(arbitro);
        return new GetArbitroDTO(arbitro);
    }

    @Override
    @Transactional
    public GetArbitroDTO updateArbitro(Long idArbitro, ArbitroDTO arbitroDTO) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
        arbitro.setNombre(arbitroDTO.getNombre());
        arbitro.setApellido(arbitroDTO.getApellido());
        arbitro.setWhatsapp(arbitroDTO.getWhatsapp());
        arbitro.setCategoria(CategoriaArbitro.fromString(arbitroDTO.getCategoria()));
        arbitro.setDisponibilidad(arbitroDTO.getEstado() != null ? arbitroDTO.getEstado() : arbitro.getDisponibilidad());
        if (arbitroDTO.getDisponibleSabado() != null) arbitro.setDisponibleSabado(arbitroDTO.getDisponibleSabado());
        if (arbitroDTO.getDisponibleDomingo() != null) arbitro.setDisponibleDomingo(arbitroDTO.getDisponibleDomingo());
        arbitro.setTalleShort(arbitroDTO.getTalleShort());
        arbitro.setTalleCamiseta(arbitroDTO.getTalleCamiseta());
        arbitroRepository.save(arbitro);
        return new GetArbitroDTO(arbitro);
    }

    @Override
    @Transactional
    public String deleteArbitro(Long idArbitro) {
        Arbitro arbitro = arbitroRepository.findById(idArbitro)
                .orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
        arbitro.setEstadoSistema(false);
        arbitro.setDisponibilidad(false);
        arbitro.setDisponibleSabado(false);
        arbitro.setDisponibleDomingo(false);
        arbitroRepository.save(arbitro);
        return "Arbitro con id " + idArbitro + " eliminado correctamente";
    }

    @Override
    @Transactional
    public String modificarDisponibilidadTotal() {
        arbitroRepository.resetearDisponibilidadDeTodos();
        return "Disponibilidad de todos los arbitros actualizada a false";
    }

    @Override
    public Page<GetArbitroDTO> traerTodos(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("apellido").ascending());
        return arbitroRepository.findAll(pageable).map(GetArbitroDTO::new);
    }
}
