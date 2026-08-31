package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.EtapaCampeonato;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.impl.DesignacionServiceImpl;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para DesignacionService")
class DesignacionServiceTest {

    @Mock
    private DesignacionRepository designacionRepository;

    @Mock
    private CanchaRepository canchaRepository;

    @Mock
    private ArbitroRepository arbitroRepository;

    @Mock
    private DesignadosRepository designadosRepository;

    @Mock
    private SuspencionRepository suspencionRepository;

    @Mock
    private ArancelRepo arancelRepo;

    private DesignacionServiceImpl designacionService;

    @BeforeEach
    void setUp() {
        designacionService = new DesignacionServiceImpl(designacionRepository, canchaRepository, arbitroRepository, designadosRepository, suspencionRepository, arancelRepo);
    }

    @Test
    @DisplayName("Debe lanzar NotFoundException al buscar ID inexistente")
    void testObtenerPorId_NoExiste() {
        when(designacionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> designacionService.obtenerPorId(1L));
    }

    @Test
    @DisplayName("Debe aceptar una designación correctamente")
    void testAceptarDesignacion_Exitosa() {
        Designacion des = new Designacion();
        des.setIdDesignacion(1L);
        des.setEstadoDesignacion(0);

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(designacionRepository.save(any(Designacion.class))).thenReturn(des);

        GetDesignacionDTO resultado = designacionService.aceptarDesignacion(1L);

        assertNotNull(resultado);
        assertEquals(1, des.getEstadoDesignacion());
        verify(designacionRepository, times(1)).save(des);
    }

    @Test
    @DisplayName("Debe fallar si el árbitro ya tiene una designación el mismo día (domingo)")
    void testAsignarArbitro_MismoDia_Domingo_LanzaBadRequestException() {
        Cancha cancha = Cancha.builder().idCancha(10L).nombreCancha("Cancha 1").build();
        LocalDateTime domingo = LocalDateTime.of(2026, 8, 30, 15, 0); // 30 de agosto 2026 es Domingo
        Designacion des = Designacion.builder()
                .idDesignacion(1L)
                .cancha(cancha)
                .fecha(domingo)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .estadoDesignacion(0)
                .build();

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(5L)
                .nombre("Juan")
                .apellido("Perez")
                .categoria(CategoriaArbitro.INTERMEDIO)
                .build();

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(arbitroRepository.findById(5L)).thenReturn(Optional.of(arbitro));
        when(designadosRepository.findByDesignacion_IdDesignacion(1L)).thenReturn(java.util.Collections.emptyList());
        when(designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(eq(5L), any(LocalDateTime.class), any(LocalDateTime.class), eq(1L)))
                .thenReturn(1L);

        com.designaciones.webdesignaciones.utils.BadRequestException ex = assertThrows(
                com.designaciones.webdesignaciones.utils.BadRequestException.class,
                () -> designacionService.asignarArbitroADesignacion(1L, 5L)
        );

        assertTrue(ex.getMessage().contains("ya tiene una designación asignada para esta fecha"));
    }

    @Test
    @DisplayName("Debe fallar al asignar si el árbitro ya estuvo en la misma cancha en la última fecha (no forzado)")
    void testAsignarArbitro_CanchaRepetida_NoForzado_LanzaBadRequestException() {
        Cancha cancha = Cancha.builder().idCancha(10L).nombreCancha("Cancha 1").build();
        LocalDateTime fechaActual = LocalDateTime.of(2026, 8, 30, 15, 0);
        Designacion des = Designacion.builder()
                .idDesignacion(1L)
                .cancha(cancha)
                .fecha(fechaActual)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .cantidadPartidos(3)
                .estadoDesignacion(0)
                .build();

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(5L)
                .nombre("Juan")
                .apellido("Perez")
                .categoria(CategoriaArbitro.INTERMEDIO)
                .build();

        Designacion desAnterior = Designacion.builder()
                .idDesignacion(99L)
                .cancha(cancha)
                .fecha(fechaActual.minusDays(7))
                .estadoDesignacion(2)
                .cantidadPartidos(3)
                .build();

        Designados desAnteriorReg = Designados.builder()
                .idDesignados(100L)
                .arbitro(arbitro)
                .designacion(desAnterior)
                .build();

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(arbitroRepository.findById(5L)).thenReturn(Optional.of(arbitro));
        when(designadosRepository.findByDesignacion_IdDesignacion(1L)).thenReturn(java.util.Collections.emptyList());
        when(designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(eq(5L), any(LocalDateTime.class), any(LocalDateTime.class), eq(1L)))
                .thenReturn(0L);
        when(designacionRepository.findFirstByCancha_IdCanchaAndFechaBeforeAndEstadoDesignacionNotOrderByFechaDesc(eq(10L), eq(fechaActual), eq(3)))
                .thenReturn(Optional.of(desAnterior));
        when(designadosRepository.findByDesignacion_IdDesignacion(99L))
                .thenReturn(List.of(desAnteriorReg));

        com.designaciones.webdesignaciones.utils.BadRequestException ex = assertThrows(
                com.designaciones.webdesignaciones.utils.BadRequestException.class,
                () -> designacionService.asignarArbitroADesignacion(1L, 5L)
        );

        assertTrue(ex.getMessage().contains("ya estuvo en esta cancha en la última fecha"));
    }

    @Test
    @DisplayName("Debe permitir asignar árbitro repetido en cancha cuando se utiliza forzarAsignarArbitroADesignacion")
    void testForzarAsignarArbitro_CanchaRepetida_Exitoso() {
        Cancha cancha = Cancha.builder().idCancha(10L).nombreCancha("Cancha 1").build();
        LocalDateTime fechaActual = LocalDateTime.of(2026, 8, 30, 15, 0);
        Designacion des = Designacion.builder()
                .idDesignacion(1L)
                .cancha(cancha)
                .fecha(fechaActual)
                .etapaCampeonato(EtapaCampeonato.FECHA_NORMAL)
                .cantidadPartidos(3)
                .estadoDesignacion(0)
                .build();

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(5L)
                .nombre("Juan")
                .apellido("Perez")
                .categoria(CategoriaArbitro.INTERMEDIO)
                .build();

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(arbitroRepository.findById(5L)).thenReturn(Optional.of(arbitro));
        when(designadosRepository.findByDesignacion_IdDesignacion(1L)).thenReturn(java.util.Collections.emptyList());
        when(designadosRepository.countByArbitroIdAndFechaExcludingDesignacion(eq(5L), any(LocalDateTime.class), any(LocalDateTime.class), eq(1L)))
                .thenReturn(0L);
        when(designadosRepository.save(any(Designados.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(designacionRepository.save(any(Designacion.class))).thenReturn(des);

        GetDesignacionDTO res = designacionService.forzarAsignarArbitroADesignacion(1L, 5L);

        assertNotNull(res);
        verify(designadosRepository, times(1)).save(any(Designados.class));
    }

    @Test
    @DisplayName("Debe obtener estadísticas ordenadas por fecha DESC por defecto")
    void testObtenerEstadisticas_OrdenDescPorDefecto() {
        LocalDateTime inicio = LocalDateTime.of(2026, 8, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 8, 31, 23, 59);

        when(designacionRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin)).thenReturn(List.of());
        when(designadosRepository.findByDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(inicio, fin)).thenReturn(List.of());

        var resDefault = designacionService.obtenerEstadisticas(inicio, fin);
        assertNotNull(resDefault);
        verify(designacionRepository, times(1)).findByFechaBetweenOrderByFechaDesc(inicio, fin);
        verify(designadosRepository, times(1)).findByDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(inicio, fin);

        var resDescParam = designacionService.obtenerEstadisticas(inicio, fin, "DESC");
        assertNotNull(resDescParam);
        verify(designacionRepository, times(2)).findByFechaBetweenOrderByFechaDesc(inicio, fin);
        verify(designadosRepository, times(2)).findByDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(inicio, fin);
    }

    @Test
    @DisplayName("Debe obtener estadísticas ordenadas por fecha ASC cuando se especifica 'ASC'")
    void testObtenerEstadisticas_OrdenAsc() {
        LocalDateTime inicio = LocalDateTime.of(2026, 8, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 8, 31, 23, 59);

        when(designacionRepository.findByFechaBetweenOrderByFechaAsc(inicio, fin)).thenReturn(List.of());
        when(designadosRepository.findByDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(inicio, fin)).thenReturn(List.of());

        var res = designacionService.obtenerEstadisticas(inicio, fin, "ASC");
        assertNotNull(res);
        verify(designacionRepository, times(1)).findByFechaBetweenOrderByFechaAsc(inicio, fin);
        verify(designadosRepository, times(1)).findByDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(inicio, fin);
    }

    @Test
    @DisplayName("Debe obtener estadísticas de árbitro ordenadas por fecha DESC por defecto y ASC cuando se especifica")
    void testObtenerEstadisticasArbitro_Orden() {
        Long idArbitro = 5L;
        LocalDateTime inicio = LocalDateTime.of(2026, 8, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 8, 31, 23, 59);
        Arbitro arbitro = Arbitro.builder().idArbitro(idArbitro).nombre("Juan").apellido("Perez").build();

        when(arbitroRepository.findById(idArbitro)).thenReturn(Optional.of(arbitro));
        when(designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(idArbitro, inicio, fin))
                .thenReturn(List.of());
        when(designadosRepository.findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(idArbitro, inicio, fin))
                .thenReturn(List.of());

        var resDefault = designacionService.obtenerEstadisticasArbitro(idArbitro, inicio, fin);
        assertNotNull(resDefault);
        assertNotNull(resDefault.getEstadisticasCanchas());
        assertEquals(10, resDefault.getEstadisticasCanchas().getSize());
        assertEquals(0, resDefault.getEstadisticasCanchas().getNumber());
        verify(designadosRepository, times(1)).findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaDesc(idArbitro, inicio, fin);

        var resAsc = designacionService.obtenerEstadisticasArbitro(idArbitro, inicio, fin, "ASC", 1, 5);
        assertNotNull(resAsc);
        assertNotNull(resAsc.getEstadisticasCanchas());
        assertEquals(5, resAsc.getEstadisticasCanchas().getSize());
        assertEquals(1, resAsc.getEstadisticasCanchas().getNumber());
        verify(designadosRepository, times(1)).findByArbitro_IdArbitroAndDesignacion_FechaBetweenOrderByDesignacion_FechaAsc(idArbitro, inicio, fin);
    }
}





