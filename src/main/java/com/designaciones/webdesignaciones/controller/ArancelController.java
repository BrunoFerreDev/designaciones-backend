package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetArancelDTO;
import com.designaciones.webdesignaciones.record.ArancelDTO;
import com.designaciones.webdesignaciones.service.ArancelService;
import com.designaciones.webdesignaciones.service.impl.ArancelServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/aranceles", name = "Manejo de araneceles")
@RequiredArgsConstructor
public class ArancelController {
    private final ArancelService arancelService;

    @GetMapping(name = "Traer todos ")
    public ResponseEntity<Page<GetArancelDTO>> traerAranceles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(arancelService.traerAranceles(page, size));
    }

    @GetMapping(value = "/cancha/{idCancha}", name = "Traer aranceles por cancha")
    public ResponseEntity<List<GetArancelDTO>> traerArancelesPorCancha(@PathVariable Long idCancha) {
        return ResponseEntity.ok(arancelService.traerArancelesPorCancha(idCancha));
    }

    @PostMapping(name = "Nuevo arancel")
    public ResponseEntity<GetArancelDTO> crearArancel(@RequestBody ArancelDTO arancel) {
        return ResponseEntity.ok(arancelService.crearNuevo(arancel));
    }

    @PutMapping(value = "/actualizar", name = "Actualizar arancel")
    public ResponseEntity<GetArancelDTO> actualizarArancel(@RequestParam Long idArancel, @RequestBody ArancelDTO arancel) {
        return ResponseEntity.ok(arancelService.actualizarArancel(idArancel, arancel));
    }

    @GetMapping(value = "/calcular", name = "Calcular arancel por arbitro")
    public ResponseEntity<Map<String, Object>> calcularArancelPorArbitro(@RequestParam Long idCancha, @RequestParam Integer cantidadPartidos) {
        BigDecimal montoPorArbitro = arancelService.calcularMontoPorArbitro(idCancha, cantidadPartidos);
        int necesarios = ArancelServiceImpl.calcularArbitrosNecesarios(cantidadPartidos);
        return ResponseEntity.ok(Map.of(
                "idCancha", idCancha,
                "cantidadPartidos", cantidadPartidos,
                "arbitrosNecesarios", necesarios,
                "montoPorArbitro", montoPorArbitro
        ));
    }
}
