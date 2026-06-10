package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.dto.get.GetArancelDTO;
import com.designaciones.webdesignaciones.model.ArancelArbitral;
import com.designaciones.webdesignaciones.record.ArancelDTO;
import com.designaciones.webdesignaciones.repository.ArancelRepo;
import com.designaciones.webdesignaciones.service.ArancelService;
import com.designaciones.webdesignaciones.service.CanchaService;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArancelServiceImpl implements ArancelService {
    private final ArancelRepo arancelRepo;
    private final CanchaService canchaService;

    @Override
    public Page<GetArancelDTO> traerAranceles(int page, int size) {
        return arancelRepo.findAll(PageRequest.of(page, size)).map(GetArancelDTO::new);
    }

    @Override
    @Transactional
    public GetArancelDTO crearNuevo(ArancelDTO arancel) {
        ArancelArbitral aa = new ArancelArbitral();
        aa.setCantidadPartidos(arancel.cantidadPartidos());
        aa.setMontoTotal(arancel.monto());
        aa.setFechaVigencia(arancel.fechaVigencia());
        aa.setDescripcion(arancel.descripcion());
        aa.setCancha(canchaService.traerPorId(arancel.idCancha()));
        aa.setActivo(true);
        arancelRepo.save(aa);
        return new GetArancelDTO(aa);
    }

    @Override
    public GetArancelDTO actualizarArancel(Long idArancel, ArancelDTO arancel) {
        ArancelArbitral ab = arancelRepo.findById(idArancel).orElseThrow(() -> new NotFoundException("Arancel no encontraod"));
        ab.setCantidadPartidos(arancel.cantidadPartidos());
        ab.setMontoTotal(arancel.monto());
        ab.setFechaVigencia(arancel.fechaVigencia());
        ab.setDescripcion(arancel.descripcion());
        ab.setCancha(canchaService.traerPorId(arancel.idCancha()));
        ab.setActivo(true);
        arancelRepo.save(ab);
        return new GetArancelDTO(ab);
    }
}
