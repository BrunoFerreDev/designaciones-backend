package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransaccionRecuperoRepository extends JpaRepository<TransaccionRecupero, Long> {
    Page<TransaccionRecupero> findByDeudaAsociada(DeudaGasto deudaGasto, Pageable pageable);
}
