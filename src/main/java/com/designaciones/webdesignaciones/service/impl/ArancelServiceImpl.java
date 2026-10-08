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

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.List;

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
    public List<GetArancelDTO> traerArancelesPorCancha(Long idCancha) {
        return arancelRepo.findByCancha_IdCanchaAndActivoTrue(idCancha)
                .stream()
                .map(GetArancelDTO::new)
                .toList();
    }

    @Override
    @Transactional
    public GetArancelDTO crearNuevo(ArancelDTO arancel) {
        ArancelArbitral aa = new ArancelArbitral();
        aa.setCantidadPartidos(arancel.cantidadPartidos());
        aa.setPrecioPorPartido(arancel.monto());
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
        ab.setPrecioPorPartido(arancel.monto());
        ab.setFechaVigencia(arancel.fechaVigencia());
        ab.setDescripcion(arancel.descripcion());
        ab.setCancha(canchaService.traerPorId(arancel.idCancha()));
        ab.setActivo(true);
        arancelRepo.save(ab);
        return new GetArancelDTO(ab);
    }

    @Override
    public BigDecimal calcularMontoPorArbitro(Long idCancha, Integer cantidadPartidos) {
        if (idCancha == null || cantidadPartidos == null) {
            return BigDecimal.ZERO;
        }
        List<ArancelArbitral> aranceles = arancelRepo.findByCancha_IdCanchaAndActivoTrue(idCancha);
        if (aranceles.isEmpty()) {
            return BigDecimal.ZERO;
        }
        ArancelArbitral arancel = aranceles.get(0);
        if (arancel.getPrecioPorPartido() == null) {
            return BigDecimal.ZERO;
        }
        int necesarios = calcularArbitrosNecesarios(cantidadPartidos);
        if (necesarios <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal montoTotal = arancel.getPrecioPorPartido().multiply(BigDecimal.valueOf(cantidadPartidos));
        return montoTotal.divide(BigDecimal.valueOf(necesarios), 2, RoundingMode.HALF_UP);
    }

    public static int calcularArbitrosNecesarios(Integer cantidadPartidos) {
        if (cantidadPartidos == null || cantidadPartidos <= 4) {
            return 3;
        } else if (cantidadPartidos <= 6) {
            return 4;
        } else {
            return 4 + (cantidadPartidos - 5) / 2;
        }
    }
}
