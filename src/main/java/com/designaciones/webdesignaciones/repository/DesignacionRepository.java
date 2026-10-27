package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Designacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignacionRepository extends JpaRepository<Designacion, Long> {

    @EntityGraph(attributePaths = {"cancha"})
    Page<Designacion> findByEstadoDesignacion(int estadoDesignacion, Pageable pageable);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findByFecha(LocalDateTime fechaEspecifica);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findByFechaBetweenOrderByFechaDesc(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findByFechaBetweenOrderByFechaAsc(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findByFechaGreaterThanEqualAndFechaLessThan(LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"cancha"})
    List<Designacion> findTop20ByFechaLessThanOrderByFechaDesc(LocalDateTime fecha);

    @Query("SELECT d FROM Designacion d WHERE EXTRACT(MONTH FROM d.fecha) = :mes AND EXTRACT(YEAR FROM d.fecha) = :anio")
    List<Designacion> findByMesAndAnio(@Param("mes") int mes, @Param("anio") int anio);

    @EntityGraph(attributePaths = {"cancha"})
    Page<Designacion> findByCancha(Cancha cancha, Pageable pageable);

    @EntityGraph(attributePaths = {"cancha"})
    Page<Designacion> findByCanchaOrderByFechaDesc(Cancha cancha, Pageable pageable);

    Optional<Designacion> findFirstByCancha_IdCanchaAndFechaBeforeAndEstadoDesignacionNotOrderByFechaDesc(Long idCancha, LocalDateTime fecha, int estadoDesignacionExcluido);

}
