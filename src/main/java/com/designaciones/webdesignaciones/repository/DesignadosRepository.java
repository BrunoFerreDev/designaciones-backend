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

    // Contar asignaciones de un árbitro en una fecha determinada (excluyendo una designación específica)
    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha = :fecha and d.designacion.idDesignacion <> :excludeDesignacionId")
    Long countByArbitroIdAndFechaExcludingDesignacion(@Param("arbitroId") Long arbitroId, @Param("fecha") LocalDateTime fecha, @Param("excludeDesignacionId") Long excludeDesignacionId);

    // Contar asignaciones de un árbitro en una fecha determinada (sin excluir)
    @Query("select count(d) from Designados d where d.arbitro.idArbitro = :arbitroId and d.designacion.fecha = :fecha")
    Long countByArbitroIdAndFecha(@Param("arbitroId") Long arbitroId, @Param("fecha") LocalDateTime fecha);

}
