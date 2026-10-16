package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.HistorialArbitroDesignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialArbitroDesignacionRepository extends JpaRepository<HistorialArbitroDesignacion, Long> {

    List<HistorialArbitroDesignacion> findByDesignacion_IdDesignacionOrderByFechaAsignacionAsc(Long idDesignacion);

    Optional<HistorialArbitroDesignacion> findFirstByDesignacion_IdDesignacionAndArbitro_IdArbitroAndActivoTrue(Long idDesignacion, Long idArbitro);

    List<HistorialArbitroDesignacion> findByDesignacion_IdDesignacionAndActivoTrue(Long idDesignacion);

    void deleteAllByDesignacion_IdDesignacion(Long idDesignacion);
}
