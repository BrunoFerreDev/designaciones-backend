package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Designados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DesignadosRepository extends JpaRepository<Designados, Long> {

    // Buscar los árbitros (ids) que estuvieron asignados en una cancha, excluyendo una designación específica
    @Query("select distinct d.arbitro.idArbitro from Designados d where d.designacion.cancha.idCancha = :canchaId and d.designacion.idDesignacion <> :excludeDesignacionId")
    List<Long> findDistinctArbitroIdsByCanchaIdExcludingDesignacion(@Param("canchaId") Long canchaId, @Param("excludeDesignacionId") Long excludeDesignacionId);

    // Obtener los designados de una designación específica
    List<Designados> findByDesignacion_IdDesignacion(Long idDesignacion);

    List<Designados> findByDesignacion_IdDesignacionIn(List<Long> idDesignaciones);

    // Contar asignaciones de un árbitro en una fecha determinada (excluyendo una designación específica)
    // Ahora comparamos por día completo (between startOfDay and endOfDay) para ignorar la hora
    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha between :start and :end and d.designacion.idDesignacion <> :excludeDesignacionId")
    Long countByArbitroIdAndFechaExcludingDesignacion(@Param("arbitroId") Long arbitroId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("excludeDesignacionId") Long excludeDesignacionId);

    // Contar asignaciones de un árbitro en una fecha determinada (sin excluir)
    // Comparación por día completo
    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha between :start and :end")
    Long countByArbitroIdAndFecha(@Param("arbitroId") Long arbitroId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

}
