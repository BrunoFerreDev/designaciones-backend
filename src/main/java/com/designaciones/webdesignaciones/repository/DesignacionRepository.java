package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Designacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DesignacionRepository extends JpaRepository<Designacion, Long> {
    List<Designacion> findByEstadoDesignacion(int estadoDesignacion);

    List<Designacion> findByFecha(LocalDateTime fechaEspecifica);

    List<Designacion> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("SELECT d FROM Designacion d WHERE EXTRACT(MONTH FROM d.fecha) = :mes AND EXTRACT(YEAR FROM d.fecha) = :anio")
    List<Designacion> findByMesAndAnio(@Param("mes") int mes, @Param("anio") int anio);
}
