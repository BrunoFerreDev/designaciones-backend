package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.DeudaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeudaGastoRepository extends JpaRepository<DeudaGasto, Long> {
}
