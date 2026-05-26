package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignadosService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignadosServiceImpl implements DesignadosService {
    private final DesignadosRepository designadosRepository;

    @Override
    public List<GetDesignadosDTO> obtenerTodosDesignados(Long idDesignacion) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return designados.stream()
                .map(GetDesignadosDTO::new)
                .toList();
    }

    @Override
    public void eliminarDesignado(Long idDesignacion, Long idDesignado) {
        Designados designado = designadosRepository.findById(idDesignado)
                .orElseThrow(() -> new RuntimeException("Designado no encontrado con ID: " + idDesignado));
        if (!designado.getDesignacion().getIdDesignacion().equals(idDesignacion)) {
            throw new RuntimeException("El designado no pertenece a la designación especificada");
        }
        designadosRepository.delete(designado);
    }
}
