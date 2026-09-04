package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Designacion;
import com.designaciones.webdesignaciones.model.Designados;
import com.designaciones.webdesignaciones.notification.NotificationService;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.service.impl.ArbitroServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para ArbitroService")
class ArbitroServiceTest {

    @Mock
    private ArbitroRepository arbitroRepository;

    @Mock
    private DesignadosRepository designadosRepository;

    @Mock
    private DesignacionRepository designacionRepository;

    @Mock
    private SuspencionRepository suspencionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private NotificationService notificationService;

    private ArbitroServiceImpl arbitroService;

    @BeforeEach
    void setUp() {
        arbitroService = new ArbitroServiceImpl(
                arbitroRepository,
                designadosRepository,
                designacionRepository,
                suspencionRepository,
                passwordEncoder,
                eventPublisher,
                notificationService
        );
    }

    @Test
    @DisplayName("Debe traer designaciones por árbitro ordenadas por fecha DESC")
    void testTraerDesignacionesPorArbitro_OrdenaPorFechaDesc() {
        Long idArbitro = 10L;
        Arbitro arbitro = Arbitro.builder().idArbitro(idArbitro).nombre("Carlos").apellido("Gomez").build();
        Designacion des = Designacion.builder().idDesignacion(50L).fecha(LocalDateTime.now()).build();
        Designados designado = Designados.builder().idDesignados(1L).arbitro(arbitro).designacion(des).build();

        when(arbitroRepository.findById(idArbitro)).thenReturn(Optional.of(arbitro));

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(designadosRepository.findByArbitroOrderByDesignacion_FechaDesc(eq(arbitro), pageableCaptor.capture()))
                .thenReturn(new PageImpl<>(List.of(designado)));

        Page<GetDesignacionDTO> result = arbitroService.traerDesignacionesPorArbitro(idArbitro, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(50L, result.getContent().get(0).getIdDesignacion());

        Pageable captured = pageableCaptor.getValue();
        assertNotNull(captured);
        assertNotNull(captured.getSort().getOrderFor("designacion.fecha"));
        assertTrue(captured.getSort().getOrderFor("designacion.fecha").isDescending());
        verify(designadosRepository, times(1)).findByArbitroOrderByDesignacion_FechaDesc(eq(arbitro), any(Pageable.class));
    }
}
