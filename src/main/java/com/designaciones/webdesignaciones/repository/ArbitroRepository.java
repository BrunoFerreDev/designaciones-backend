package com.designaciones.webdesignaciones.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.designaciones.webdesignaciones.model.Arbitro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArbitroRepository extends JpaRepository<Arbitro, Long> {
    Page<Arbitro> findByDisponibilidadTrue(Pageable pageable);

    // Obtener todos los árbitros activos
    List<Arbitro> findByDisponibilidadTrueAndEstadoSistemaTrue();

    Page<Arbitro> findByDisponibilidadTrueAndEstadoSistemaTrue(Pageable pageable);

    Page<Arbitro> findByEstadoSistemaTrue(Pageable pageable);
}
