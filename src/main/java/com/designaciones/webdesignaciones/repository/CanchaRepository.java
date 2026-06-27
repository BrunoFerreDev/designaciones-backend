package com.designaciones.webdesignaciones.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.designaciones.webdesignaciones.model.Cancha;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CanchaRepository extends JpaRepository<Cancha, Long> {
    Page<Cancha> findByEstadoTrue(Pageable pageable);
    List<Cancha> findAllByEstadoTrue();
}
