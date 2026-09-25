package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.post.ActualizarRolesBulkDTO;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ArbitroRoleService {
    Page<GetArbitroDTO> findByRol(RolUsuario rol, int page, int size);
    List<GetArbitroDTO> actualizarRolesBulk(List<ActualizarRolesBulkDTO> dtos);
}
