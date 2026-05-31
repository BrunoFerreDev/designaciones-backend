package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Arbitro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArbitroRepository extends JpaRepository<Arbitro, Long> {
    Page<Arbitro> findByDisponibilidadTrue(Pageable pageable);

    // Obtener todos los árbitros activos (general)
    List<Arbitro> findByDisponibilidadTrueAndEstadoSistemaTrue();

    @Query("SELECT a FROM Arbitro a WHERE a.estadoSistema = true AND (a.disponibilidad = true OR a.disponibleSabado = true)")
    List<Arbitro> findActivosDisponiblesParaSabado();

    @Query("SELECT a FROM Arbitro a WHERE a.estadoSistema = true AND (a.disponibilidad = true OR a.disponibleDomingo = true)")
    List<Arbitro> findActivosDisponiblesParaDomingo();

    Page<Arbitro> findByDisponibilidadTrueAndEstadoSistemaTrue(Pageable pageable);

    Page<Arbitro> findByEstadoSistemaTrue(Pageable pageable);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Arbitro a SET a.disponibilidad = false, a.disponibleSabado = false, a.disponibleDomingo = false")
    void resetearDisponibilidadDeTodos();
}
