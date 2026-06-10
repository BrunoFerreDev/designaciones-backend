package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.ArancelArbitral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArancelRepo extends JpaRepository<ArancelArbitral, Long> {
    ArancelArbitral findByCantidadPartidosAndCancha_IdCanchaAndActivoTrue(int cantidadPartidos, Long idCancha);
}
