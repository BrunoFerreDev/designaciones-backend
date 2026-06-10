package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignadosService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    @Override
    @Transactional
    public String actualizarMonto(Long idDesignado, BigDecimal nuevoMonto) {
        Designados designados = designadosRepository.findById(idDesignado).orElseThrow(() -> new NotFoundException("Designado no encontrado"));
        designados.setMontoPercibido(nuevoMonto);
        designadosRepository.save(designados);
        return "Monto actualizado correctamente";
    }

    @Override
    public String actualizarMontoCompleto(Long idDesignacion, BigDecimal montoPorArbitro) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Designados d : designados) {
            d.setMontoPercibido(montoPorArbitro);
            designadosRepository.save(d);
        }
        return "Montos actualizados correctamente";
    }
}
