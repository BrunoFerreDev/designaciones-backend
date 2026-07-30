package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {
    Optional<Caja> findByActivoAndAnio(Boolean activo, int anio);

    @Query("SELECT c FROM Caja c WHERE c.nombre = 'Soporte'")
    Caja cajaSoporte();
}
