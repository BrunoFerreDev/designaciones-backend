package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.TemaReunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemaReunionRepository extends JpaRepository<TemaReunion, Long> {
    List<TemaReunion> findByReunion_IdReunionOrderByOrdenAsc(Long idReunion);
    void deleteByReunion_IdReunion(Long idReunion);
}
