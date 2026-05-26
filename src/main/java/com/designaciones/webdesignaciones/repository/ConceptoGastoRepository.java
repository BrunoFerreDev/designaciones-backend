package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.ConceptoGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConceptoGastoRepository extends JpaRepository<ConceptoGasto, Long> {
}
