package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Designados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignadosRepository extends JpaRepository<Designados, Long> {

    // Buscar los árbitros (ids) que estuvieron asignados en una cancha, excluyendo una designación específica
    @Query("select distinct d.arbitro.idArbitro from Designados d where d.designacion.cancha.idCancha = :canchaId and d.designacion.idDesignacion <> :excludeDesignacionId")
    List<Long> findDistinctArbitroIdsByCanchaIdExcludingDesignacion(@Param("canchaId") Long canchaId, @Param("excludeDesignacionId") Long excludeDesignacionId);

    // Obtener los designados de una designación específica
    List<Designados> findByDesignacion_IdDesignacion(Long idDesignacion);
    // Busca el último partido del árbitro (por fecha) antes de la designación actual
    Optional<Designados> findFirstByArbitro_IdArbitroAndDesignacion_FechaBeforeOrderByDesignacion_FechaDesc(Long idArbitro, LocalDateTime fecha);

    List<Designados> findByDesignacion_IdDesignacionIn(List<Long> idDesignaciones);

    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha between :start and :end and d.designacion.idDesignacion <> :excludeDesignacionId")
    Long countByArbitroIdAndFechaExcludingDesignacion(@Param("arbitroId") Long arbitroId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeDesignacionId") Long excludeDesignacionId);

    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha between :start and :end")
    Long countByArbitroIdAndFecha(@Param("arbitroId") Long arbitroId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    void deleteAllByDesignacion_IdDesignacion(Long idDesignacion);

    @Query("SELECT COUNT(d) > 0 FROM Designados d " +
            "WHERE d.arbitro.idArbitro = :idArbitro " +
            "AND d.designacion.cancha.idCancha = :idCancha " +
            "AND d.designacion.fecha BETWEEN :startDate AND :endDate")
    boolean verificarCanchaReciente(
            @Param("idArbitro") Long idArbitro,
            @Param("idCancha") Long idCancha,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
