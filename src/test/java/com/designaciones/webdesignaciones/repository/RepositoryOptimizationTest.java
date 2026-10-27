package com.designaciones.webdesignaciones.repository;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryOptimizationTest {

    @Autowired
    private DesignacionRepository designacionRepository;

    @Autowired
    private DesignadosRepository designadosRepository;

    @Autowired
    private ArbitroRepository arbitroRepository;

    @Autowired
    private CanchaRepository canchaRepository;

    @Test
    @DisplayName("ArbitroRepository.findByEstadoSistemaTrue debe traer solo activos")
    void testFindByEstadoSistemaTrue() {
        Arbitro activo = Arbitro.builder()
                .nombre("Juan")
                .apellido("Pérez")
                .whatsapp("5491111111111")
                .contrasenia("pass123")
                .categoria(CategoriaArbitro.PRINCIPAL_1)
                .estadoSistema(true)
                .roles(Set.of(RolUsuario.ARBITRO))
                .build();
        Arbitro inactivo = Arbitro.builder()
                .nombre("Carlos")
                .apellido("López")
                .whatsapp("5492222222222")
                .contrasenia("pass123")
                .categoria(CategoriaArbitro.INICIAL)
                .estadoSistema(false)
                .roles(Set.of(RolUsuario.ARBITRO))
                .build();

        arbitroRepository.save(activo);
        arbitroRepository.save(inactivo);

        List<Arbitro> activos = arbitroRepository.findByEstadoSistemaTrue();
        assertFalse(activos.isEmpty());
        assertTrue(activos.stream().allMatch(a -> Boolean.TRUE.equals(a.getEstadoSistema())));
        assertTrue(activos.stream().anyMatch(a -> a.getIdArbitro().equals(activo.getIdArbitro())));
        assertFalse(activos.stream().anyMatch(a -> a.getIdArbitro().equals(inactivo.getIdArbitro())));
    }

    @Test
    @DisplayName("DesignacionRepository queries indexadas por fecha y límites")
    void testDesignacionIndexedQueries() {
        Cancha cancha = canchaRepository.save(Cancha.builder()
                .nombreCancha("Cancha Test")
                .categoria(Categoria.FUTBOL_11)
                .fueraDeJuego(false)
                .estado(true)
                .build());

        LocalDateTime now = LocalDateTime.of(2026, 10, 20, 10, 0);

        Designacion d1 = designacionRepository.save(Designacion.builder()
                .cancha(cancha)
                .fecha(now.minusDays(5))
                .cantidadPartidos(2)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .estadoDesignacion(1)
                .editable(true)
                .build());

        Designacion d2 = designacionRepository.save(Designacion.builder()
                .cancha(cancha)
                .fecha(now.minusDays(2))
                .cantidadPartidos(3)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .estadoDesignacion(1)
                .editable(true)
                .build());

        // Test findTop20ByFechaLessThanOrderByFechaDesc
        List<Designacion> topDesc = designacionRepository.findTop20ByFechaLessThanOrderByFechaDesc(now);
        assertFalse(topDesc.isEmpty());
        assertEquals(d2.getIdDesignacion(), topDesc.get(0).getIdDesignacion());

        // Test findByFechaGreaterThanEqualAndFechaLessThan
        List<Designacion> porRango = designacionRepository.findByFechaGreaterThanEqualAndFechaLessThan(
                now.minusDays(3), now.plusDays(1));
        assertEquals(1, porRango.size());
        assertEquals(d2.getIdDesignacion(), porRango.get(0).getIdDesignacion());
    }

    @Test
    @DisplayName("DesignadosRepository.sumMontoPercibidoByDesignacionIds calcula suma agregada")
    void testSumMontoPercibidoByDesignacionIds() {
        Cancha cancha = canchaRepository.save(Cancha.builder()
                .nombreCancha("Cancha Finanzas")
                .categoria(Categoria.FUTBOL_11)
                .fueraDeJuego(false)
                .estado(true)
                .build());

        Arbitro arbitro = arbitroRepository.save(Arbitro.builder()
                .nombre("Mario")
                .apellido("Gomez")
                .whatsapp("5493333333333")
                .contrasenia("pass123")
                .categoria(CategoriaArbitro.PRINCIPAL_1)
                .estadoSistema(true)
                .roles(Set.of(RolUsuario.ARBITRO))
                .build());

        Designacion d = designacionRepository.save(Designacion.builder()
                .cancha(cancha)
                .fecha(LocalDateTime.now())
                .cantidadPartidos(2)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .estadoDesignacion(2)
                .editable(false)
                .build());

        designadosRepository.save(Designados.builder()
                .designacion(d)
                .arbitro(arbitro)
                .categoriaArbitro(CategoriaArbitro.PRINCIPAL_1)
                .partidosDirigidos(2)
                .montoPercibido(new BigDecimal("15000.00"))
                .participo(true)
                .build());

        designadosRepository.save(Designados.builder()
                .designacion(d)
                .arbitro(arbitro)
                .categoriaArbitro(CategoriaArbitro.ASISTENTE)
                .partidosDirigidos(2)
                .montoPercibido(new BigDecimal("10000.00"))
                .participo(true)
                .build());

        BigDecimal total = designadosRepository.sumMontoPercibidoByDesignacionIds(List.of(d.getIdDesignacion()));
        assertEquals(0, new BigDecimal("25000.00").compareTo(total));

        BigDecimal vacio = designadosRepository.sumMontoPercibidoByDesignacionIds(List.of(999999L));
        assertEquals(0, BigDecimal.ZERO.compareTo(vacio));
    }
}
