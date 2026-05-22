package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.HistorialDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialRepo extends JpaRepository<HistorialDisponibilidad, Long> {
}
