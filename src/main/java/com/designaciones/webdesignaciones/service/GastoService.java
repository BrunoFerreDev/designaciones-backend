package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetConceptosDTO;
import com.designaciones.webdesignaciones.dto.get.GetGastoDTO;
import com.designaciones.webdesignaciones.dto.post.ConceptoGastoDTO;
import com.designaciones.webdesignaciones.dto.post.GastoDTO;
import com.designaciones.webdesignaciones.dto.post.ReporteDto;
import org.springframework.data.domain.Page;

public interface GastoService {
    String crearConcepto(ConceptoGastoDTO nuevoConcepto);

    Page<GetConceptosDTO> traerConceptos(int page, int size);

    GetGastoDTO registrarGasto(GastoDTO gasto);

    GetGastoDTO actualizarGasto(Long idGasto, GastoDTO gastoDTO);

    ReporteDto generarReporteGasto(Long idGasto) throws Exception;
}
