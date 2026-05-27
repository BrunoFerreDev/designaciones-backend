package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Prestamo;
import com.designaciones.webdesignaciones.model.subModel.PagoPrestamo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoPrestamoRepository extends JpaRepository<PagoPrestamo, Long> {
    Page<PagoPrestamo> findByPrestamo(Prestamo prestamo, Pageable pageable);
}
