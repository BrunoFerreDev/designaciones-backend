package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.post.ActualizarRolesBulkDTO;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.service.ArbitroRoleService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArbitroRoleServiceImpl implements ArbitroRoleService {

    private final ArbitroRepository arbitroRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<GetArbitroDTO> findByRol(RolUsuario rol, int page, int size) {
        return arbitroRepository.findByRol(rol, PageRequest.of(page, size))
                .map(GetArbitroDTO::new);
    }

    @Override
    @Transactional
    public List<GetArbitroDTO> actualizarRolesBulk(List<ActualizarRolesBulkDTO> dtos) {
        List<GetArbitroDTO> result = new ArrayList<>();
        for (ActualizarRolesBulkDTO dto : dtos) {
            Arbitro arbitro = arbitroRepository.findById(dto.idArbitro())
                    .orElseThrow(() -> new NotFoundException("Árbitro no encontrado con ID: " + dto.idArbitro()));

            if (dto.roles() != null && !dto.roles().isEmpty()) {
                arbitro.setRoles(new HashSet<>(dto.roles()));
            }
            Arbitro guardado = arbitroRepository.save(arbitro);
            result.add(new GetArbitroDTO(guardado));
        }
        return result;
    }
}
