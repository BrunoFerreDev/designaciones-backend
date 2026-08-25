package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.ArancelArbitral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ArancelRepo extends JpaRepository<ArancelArbitral, Long> {
    ArancelArbitral findByCantidadPartidosAndCancha_IdCanchaAndActivoTrue(int cantidadPartidos, Long idCancha);

    List<ArancelArbitral> findByCancha_IdCanchaAndActivoTrue(Long idCancha);

    @Query("SELECT a FROM ArancelArbitral a WHERE a.cancha.idCancha = :idCancha AND a.cantidadPartidos = :cantidadPartidos AND a.activo = true AND (a.fechaVigencia IS NULL OR a.fechaVigencia <= :fecha) ORDER BY a.fechaVigencia DESC")
    List<ArancelArbitral> findArancelVigenteParaFecha(
            @Param("idCancha") Long idCancha,
            @Param("cantidadPartidos") int cantidadPartidos,
            @Param("fecha") LocalDate fecha);

    @Query("SELECT a FROM ArancelArbitral a WHERE a.cancha.idCancha = :idCancha AND a.activo = true AND (a.fechaVigencia IS NULL OR a.fechaVigencia <= :fecha) ORDER BY a.fechaVigencia DESC")
    List<ArancelArbitral> findArancelVigentePorCanchaParaFecha(
            @Param("idCancha") Long idCancha,
            @Param("fecha") LocalDate fecha);
}
