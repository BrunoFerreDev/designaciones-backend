package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
import com.designaciones.webdesignaciones.service.impl.DesignacionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para DesignacionService - Cálculo de Árbitros")
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
    @DisplayName("Debe lanzar excepción si la designación no existe")
    void testAsignarAutomatico_DesignacionNoExiste() {
        when(designacionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> designacionService.asignarArbitrosAutomaticamente(1L));
    }

    @Test
    @DisplayName("Debe lanzar excepción si la designación no tiene cancha")
    void testAsignarAutomatico_SinCancha() {
        Designacion des = new Designacion();
        des.setIdDesignacion(1L);
        des.setCancha(null);
        des.setCantidadPartidos(3);

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));

        assertThrows(RuntimeException.class, () -> designacionService.asignarArbitrosAutomaticamente(1L));
    }

    @Test
    @DisplayName("Debe asignar 3 árbitros para 1-4 partidos")
    void testAsignarAutomatico_1a4Partidos() {
        for (int partidos : new int[]{1, 2, 3, 4}) {
            testAsignarConPartidos(partidos, 3);
        }
    }

    @Test
    @DisplayName("Debe asignar 4 árbitros para 5-6 partidos")
    void testAsignarAutomatico_5a6Partidos() {
        for (int partidos : new int[]{5, 6}) {
            testAsignarConPartidos(partidos, 4);
        }
    }

    @Test
    @DisplayName("Debe asignar 5 árbitros para 7-8 partidos")
    void testAsignarAutomatico_7a8Partidos() {
        for (int partidos : new int[]{7, 8}) {
            testAsignarConPartidos(partidos, 5);
        }
    }

    @Test
    @DisplayName("Debe asignar 6 árbitros para 9-10 partidos")
    void testAsignarAutomatico_9a10Partidos() {
        for (int partidos : new int[]{9, 10}) {
            testAsignarConPartidos(partidos, 6);
        }
    }

    @Test
    @DisplayName("Debe asignar 7 árbitros para 11-12 partidos")
    void testAsignarAutomatico_11a12Partidos() {
        for (int partidos : new int[]{11, 12}) {
            testAsignarConPartidos(partidos, 7);
        }
    }

    @Test
    @DisplayName("Debe asignar 3 árbitros por defecto para null partidos")
    void testAsignarAutomatico_NullPartidos() {
        testAsignarConPartidos(null, 3);
    }

    @Test
    @DisplayName("Debe lanzar excepción si no hay suficientes árbitros activos")
    void testAsignarAutomatico_InsuficientesArbitros() {
        Cancha cancha = new Cancha();
        cancha.setIdCancha(1L);
        cancha.setNombreCancha("Cancha Test");
        cancha.setEstado(true);

        Designacion des = new Designacion();
        des.setIdDesignacion(1L);
        des.setCancha(cancha);
        des.setCantidadPartidos(7); // necesita 5 árbitros

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(designadosRepository.findDistinctArbitroIdsByCanchaIdExcludingDesignacion(1L, 1L)).thenReturn(new ArrayList<>());
        when(designadosRepository.findByDesignacion_IdDesignacion(1L)).thenReturn(new ArrayList<>());
        // Solo 2 árbitros activos (insuficiente para los 5 necesarios)
        List<Arbitro> activos = new ArrayList<>();
        activos.add(crearArbitro(1L, "Arbitro", "1"));
        activos.add(crearArbitro(2L, "Arbitro", "2"));
        when(arbitroRepository.findByEstadoSistemaTrue()).thenReturn(activos);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> designacionService.asignarArbitrosAutomaticamente(1L));
        assertTrue(ex.getMessage().contains("No hay suficientes árbitros activos"));
    }

    // Helper: prueba la asignación automática con una cantidad específica de partidos
    private void testAsignarConPartidos(Integer partidos, int esperadosArbitros) {
        Cancha cancha = new Cancha();
        cancha.setIdCancha(1L);
        cancha.setNombreCancha("Cancha Test");
        cancha.setEstado(true);

        Designacion des = new Designacion();
        des.setIdDesignacion(1L);
        des.setCancha(cancha);
        des.setCantidadPartidos(partidos);

        when(designacionRepository.findById(1L)).thenReturn(Optional.of(des));
        when(designadosRepository.findDistinctArbitroIdsByCanchaIdExcludingDesignacion(1L, 1L)).thenReturn(new ArrayList<>());
        when(designadosRepository.findByDesignacion_IdDesignacion(1L)).thenReturn(new ArrayList<>());

        List<Arbitro> activos = new ArrayList<>();
        int cantidadDisponible = Math.max(esperadosArbitros + 2, 10); // Asegurar suficientes
        for (int i = 1; i <= cantidadDisponible; i++) {
            activos.add(crearArbitro((long) i, "Arbitro", String.valueOf(i)));
        }
        when(arbitroRepository.findByEstadoSistemaTrue()).thenReturn(activos);
        when(designadosRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(designacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // No debe lanzar excepción
        assertDoesNotThrow(() -> designacionService.asignarArbitrosAutomaticamente(1L));

        // Verificar que se guardaron los designados correctos
        verify(designadosRepository, times(esperadosArbitros)).save(any(Designados.class));
    }

    private Arbitro crearArbitro(Long id, String nombre, String apellido) {
        Arbitro arbitro = new Arbitro();
        arbitro.setIdArbitro(id);
        arbitro.setNombre(nombre);
        arbitro.setApellido(apellido);
        arbitro.setEstadoSistema(true);
        return arbitro;
    }
}




