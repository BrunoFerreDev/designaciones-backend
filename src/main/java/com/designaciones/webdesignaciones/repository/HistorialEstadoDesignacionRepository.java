package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.HistorialEstadoDesignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialEstadoDesignacionRepository extends JpaRepository<HistorialEstadoDesignacion, Long> {

    List<HistorialEstadoDesignacion> findByDesignacion_IdDesignacionOrderByFechaCambioAsc(Long idDesignacion);

    void deleteAllByDesignacion_IdDesignacion(Long idDesignacion);
}
