package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.hateoas.PagedModel;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArbitroRepository extends JpaRepository<Arbitro, Long> {
    // Obtener todos los árbitros activos (general)
    List<Arbitro> findByEstadoSistemaTrue();

    Arbitro findByWhatsapp(String whatsapp);

    @Query("SELECT a FROM Arbitro a WHERE a.estadoSistema = true AND (a.estadoSistema = true OR a.disponibleSabado = true)")
    List<Arbitro> findActivosDisponiblesParaSabado();

    @Query("SELECT a FROM Arbitro a WHERE a.estadoSistema = true AND (a.estadoSistema = true OR a.disponibleDomingo = true)")
    List<Arbitro> findActivosDisponiblesParaDomingo();

    Page<Arbitro> findByEstadoSistemaTrue(Pageable pageable);

    @Modifying
    @Query("UPDATE Arbitro a SET a.disponibleSabado = false, a.disponibleDomingo = false")
    void resetearDisponibilidadDeTodos();

    Page<Arbitro> findByDisponibleSabadoTrueAndDisponibleDomingoTrue(Pageable pageable);

    @Query("SELECT a FROM Arbitro a WHERE a.estadoSistema = true AND (a.disponibleSabado = false AND a.disponibleDomingo = false)")
    Page<Arbitro> findByDisponibleSabadoFalseOrDisponibleDomingoFalse(Pageable pageable);
}
