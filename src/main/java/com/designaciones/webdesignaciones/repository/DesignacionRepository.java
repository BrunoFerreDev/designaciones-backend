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

@Repository
public interface DesignacionRepository extends JpaRepository<Designacion, Long> {
    Page<Designacion> findByEstadoDesignacion(int estadoDesignacion, Pageable pageable);

    List<Designacion> findByFecha(LocalDateTime fechaEspecifica);

    List<Designacion> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("SELECT d FROM Designacion d WHERE EXTRACT(MONTH FROM d.fecha) = :mes AND EXTRACT(YEAR FROM d.fecha) = :anio")
    List<Designacion> findByMesAndAnio(@Param("mes") int mes, @Param("anio") int anio);

    Page<Designacion> findByCancha(Cancha cancha, Pageable pageable);

    Page<Designacion> findByCanchaOrderByFechaDesc(Cancha cancha, Pageable pageable);
}
