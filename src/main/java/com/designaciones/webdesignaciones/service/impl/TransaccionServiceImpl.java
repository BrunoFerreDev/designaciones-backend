package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetTransaccionesDTO;
import com.designaciones.webdesignaciones.model.Transaccion;
import com.designaciones.webdesignaciones.repository.TransaccionRepository;
import com.designaciones.webdesignaciones.service.TransaccionService;
import com.designaciones.webdesignaciones.utils.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Primary
@Service
@RequiredArgsConstructor
public class TransaccionServiceImpl implements TransaccionService {

    private final TransaccionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<GetTransaccionesDTO> traerTransacciones(int page, int size) {
        Page<Transaccion> transacciones = transactionRepository.findAll(PageRequest.of(page, size, Sort.by("fechaTransaccion").descending()));
        return transacciones.map(GetTransaccionesDTO::new);
    }

    @Override
    @Transactional(readOnly = true)
    public GetTransaccionesDTO traerTransaccionPorId(Long idTransaccion) {
        Transaccion transaccion = transactionRepository.findById(idTransaccion)
                .orElseThrow(() -> new BadRequestException("Transacción no encontrada con ID: " + idTransaccion));
        return new GetTransaccionesDTO(transaccion);
    }
}
