package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.designaciones.webdesignaciones.model.subModel.TransaccionRecupero;
@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

	// Devuelve transacciones excluyendo las de tipo TransaccionRecupero (cobros de recupero)
	@Query("select t from Transaccion t where type(t) <> ?1")
	Page<Transaccion> findAllExceptType(Class<?> subtype, Pageable pageable);

	default Page<Transaccion> findAllExceptRecupero(Pageable pageable) {
		return findAllExceptType(TransaccionRecupero.class, pageable);
	}
}
