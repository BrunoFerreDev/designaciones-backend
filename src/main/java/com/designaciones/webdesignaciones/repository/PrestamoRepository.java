package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Prestamo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.nio.channels.FileChannel;


import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    Page<Prestamo> findByArbitro(Arbitro arbitro, PageRequest of);

    List<Prestamo> findByArbitro(Arbitro arbitro);

    List<Prestamo> findByArbitroAndEstado(Arbitro arbitro, String estado);

    List<Prestamo> findByEstado(String estado);

    Page<Prestamo> findAllByEstado(Pageable pageable, String estado);
}
