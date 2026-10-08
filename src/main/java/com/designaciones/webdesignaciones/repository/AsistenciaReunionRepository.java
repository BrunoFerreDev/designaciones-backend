package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.enums.EstadoAsistencia;
import com.designaciones.webdesignaciones.model.AsistenciaReunion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaReunionRepository extends JpaRepository<AsistenciaReunion, Long> {
    List<AsistenciaReunion> findByReunion_IdReunion(Long idReunion);
    Optional<AsistenciaReunion> findByReunion_IdReunionAndArbitro_IdArbitro(Long idReunion, Long idArbitro);
    long countByReunion_IdReunionAndEstadoAsistencia(Long idReunion, EstadoAsistencia estadoAsistencia);
    long countByReunion_IdReunionAndDisponibleSabadoTrue(Long idReunion);
    long countByReunion_IdReunionAndDisponibleDomingoTrue(Long idReunion);
    void deleteByReunion_IdReunion(Long idReunion);
}
