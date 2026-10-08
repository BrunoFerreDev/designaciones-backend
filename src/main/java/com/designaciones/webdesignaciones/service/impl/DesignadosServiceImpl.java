package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetDesignadosDTO;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.service.DesignadosService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignadosServiceImpl implements DesignadosService {
    private final DesignadosRepository designadosRepository;
    private final DesignacionRepository designacionRepository;
    private final ArbitroRepository arbitroRepository;

    @Override
    @Cacheable(value = "designados", key = "#idDesignacion")
    public List<GetDesignadosDTO> obtenerTodosDesignados(Long idDesignacion) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        return designados.stream()
                .map(GetDesignadosDTO::new)
                .toList();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
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
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public String actualizarMonto(Long idDesignado, BigDecimal nuevoMonto) {
        Designados designados = designadosRepository.findById(idDesignado).orElseThrow(() -> new NotFoundException("Designado no encontrado"));
        designados.setMontoPercibido(nuevoMonto);
        designadosRepository.save(designados);
        return "Monto actualizado correctamente";
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public String actualizarMontoCompleto(Long idDesignacion, BigDecimal montoPorArbitro) {
        List<Designados> designados = designadosRepository.findByDesignacion_IdDesignacion(idDesignacion);
        for (Designados d : designados) {
            d.setMontoPercibido(montoPorArbitro);
            designadosRepository.save(d);
        }
        return "Montos actualizados correctamente";
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "designaciones", allEntries = true),
            @CacheEvict(value = "designados", allEntries = true)
    })
    public String actualizarPartidos(Long idDesignacion, Long idDesignado, int cantidad) {
        Designacion designacion = designacionRepository.findById(idDesignacion).orElseThrow(() -> new NotFoundException("Designacion no encontrada"));
        Designados designados = designadosRepository.findById(idDesignado).orElseThrow(() -> new NotFoundException("Arbitro no encontrado"));
        if (designados.getDesignacion().equals(designacion)) {
            designados.setPartidosDirigidos(cantidad);
            designadosRepository.save(designados);
            return "Cantidad de partidos asignado correctamente";
        } else {
            return "Error al cargar los datos";
        }
    }

}
