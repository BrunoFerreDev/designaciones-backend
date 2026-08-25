package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
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
}





