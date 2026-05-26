package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Prestamo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    Page<Prestamo> findByArbitro(Arbitro arbitro, PageRequest of);
}
