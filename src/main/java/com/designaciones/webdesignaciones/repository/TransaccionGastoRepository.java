package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransaccionGastoRepository extends JpaRepository<TransaccionGasto, Long> {
    Page<TransaccionGasto> findByRequiereRecupero(Boolean requiereRecupero, Pageable pageable);

    List<TransaccionGasto> findByRequiereRecupero(Boolean requiereRecupero);
}
