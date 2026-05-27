package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.DeudaGasto;
import com.designaciones.webdesignaciones.model.subModel.TransaccionGasto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeudaGastoRepository extends JpaRepository<DeudaGasto, Long> {
    boolean existsByGastoOriginalAndArbitro(TransaccionGasto gastoOriginal, Arbitro arbitro);

    Page<DeudaGasto> findByGastoOriginal(TransaccionGasto gasto, PageRequest of);

    // Devuelve todas las deudas asociadas a un gasto y un árbitro (en caso de duplicados)
    java.util.List<DeudaGasto> findByGastoOriginalAndArbitro(TransaccionGasto transaccionGasto, Arbitro arbitro);

    // Obtener la última deuda (por id) asociada a un gasto y árbitro — útil si hay múltiples
    DeudaGasto findTopByGastoOriginalAndArbitroOrderByIdDeudaDesc(TransaccionGasto transaccionGasto, Arbitro arbitro);
}
