package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Reunion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReunionRepository extends JpaRepository<Reunion, Long> {
    Page<Reunion> findAllByOrderByFechaDesc(Pageable pageable);
    Page<Reunion> findByFechaBetweenOrderByFechaDesc(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

}
