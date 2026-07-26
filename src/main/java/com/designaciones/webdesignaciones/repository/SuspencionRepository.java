package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Suspencion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SuspencionRepository extends JpaRepository<Suspencion, Long> {
    Page<Suspencion> findByArbitro(Arbitro arbitro, PageRequest of);

    List<Suspencion> findByArbitroAndCancha(Arbitro arbitro, Cancha cancha);

    @Query("SELECT COUNT(s) > 0 FROM Suspencion s WHERE s.arbitro.idArbitro = :arbitro AND s.tipoSuspencion = 2 AND s.fechaFin > :fecha")
    Boolean existePorArbitro(@Param("arbitro") Long arbitro, @Param("fecha") LocalDateTime fecha);

}
