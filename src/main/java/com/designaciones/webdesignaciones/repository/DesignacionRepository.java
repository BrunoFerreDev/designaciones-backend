package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Designacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignacionRepository extends JpaRepository<Designacion, Long> {
    Page<Designacion> findByEstadoDesignacion(int estadoDesignacion, Pageable pageable);

    List<Designacion> findByFecha(LocalDateTime fechaEspecifica);

    List<Designacion> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("SELECT d FROM Designacion d WHERE EXTRACT(MONTH FROM d.fecha) = :mes AND EXTRACT(YEAR FROM d.fecha) = :anio")
    List<Designacion> findByMesAndAnio(@Param("mes") int mes, @Param("anio") int anio);

    Page<Designacion> findByCancha(Cancha cancha, Pageable pageable);

    Page<Designacion> findByCanchaOrderByFechaDesc(Cancha cancha, Pageable pageable);

    /*@Query(value = "SELECT DISTINCT ON (d.id_canchah) d.* " +
            "FROM designacion d " +
            "WHERE d.id_canchah IN :canchaIds " +
            "ORDER BY d.id_canchah, d.fecha DESC",
            nativeQuery = true)
    List<Designacion> findUltimasDesignacionesPorCanchasNative(@Param("canchaIds") List<Long> canchaIds);*/

  /*  @Query(value = "SELECT * FROM ( " +
            "  SELECT d.*, ROW_NUMBER() OVER(PARTITION BY d.id_canchah ORDER BY d.fecha DESC) as rn " +
            "  FROM designacion d " +
            ") t WHERE t.rn = 1", nativeQuery = true)
    List<Designacion> findUltimasDesignacionesPorCanchaNativa();*/

}
