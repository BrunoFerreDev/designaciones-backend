package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.DesignacionRepository;
import com.designaciones.webdesignaciones.repository.DesignadosRepository;
import com.designaciones.webdesignaciones.repository.SuspencionRepository;
import com.designaciones.webdesignaciones.security.JwtUtils;
import com.designaciones.webdesignaciones.security.SecurityService;
import com.designaciones.webdesignaciones.security.UserDetailServiceImpl;
import com.designaciones.webdesignaciones.service.impl.ArbitroServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests para roles múltiples y seguridad de árbitros")
class ArbitroSecurityAndRolesTest {

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
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @Test
    @DisplayName("Arbitro por defecto debe tener rol ARBITRO")
    void testArbitroRolesPorDefecto() {
        Arbitro arbitro = new Arbitro();
        assertNotNull(arbitro.getRoles());
        assertTrue(arbitro.getRoles().contains(RolUsuario.ARBITRO));
        assertTrue(arbitro.tieneRol(RolUsuario.ARBITRO));
        assertFalse(arbitro.tieneRol(RolUsuario.SUPERUSER));
    }

    @Test
    @DisplayName("Arbitro puede acumular múltiples roles")
    void testArbitroMultiplesRoles() {
        Arbitro arbitro = new Arbitro();
        arbitro.agregarRol(RolUsuario.DESIGNADOR);
        arbitro.agregarRol(RolUsuario.SECRETARIO);

        assertTrue(arbitro.tieneRol(RolUsuario.ARBITRO));
        assertTrue(arbitro.tieneRol(RolUsuario.DESIGNADOR));
        assertTrue(arbitro.tieneRol(RolUsuario.SECRETARIO));
        assertEquals(3, arbitro.getRoles().size());

        arbitro.quitarRol(RolUsuario.SECRETARIO);
        assertFalse(arbitro.tieneRol(RolUsuario.SECRETARIO));
    }

    @Test
    @DisplayName("UserDetailServiceImpl debe cargar authorities para todos los roles del árbitro")
    void testUserDetailsServiceCargaMultiplesRoles() {
        UserDetailServiceImpl userDetailsService = new UserDetailServiceImpl(arbitroRepository, passwordEncoder, jwtUtils);

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(10L)
                .nombre("Juan")
                .apellido("Perez")
                .whatsapp("1122334455")
                .contrasenia("encodedPass")
                .estadoSistema(true)
                .roles(new HashSet<>(Set.of(RolUsuario.ARBITRO, RolUsuario.DESIGNADOR)))
                .build();

        when(arbitroRepository.findByWhatsapp("1122334455")).thenReturn(arbitro);

        UserDetails userDetails = userDetailsService.loadUserByUsername("1122334455");

        assertNotNull(userDetails);
        assertEquals("1122334455", userDetails.getUsername());
        Set<String> authNames = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        assertTrue(authNames.contains("ROLE_ARBITRO"));
        assertTrue(authNames.contains("ROLE_DESIGNADOR"));
        assertFalse(authNames.contains("ROLE_SUPERUSER"));
    }

    @Test
    @DisplayName("SUPERUSER debe recibir autoridades de todos los roles")
    void testSuperuserTieneAccesoATodosLosRoles() {
        UserDetailServiceImpl userDetailsService = new UserDetailServiceImpl(arbitroRepository, passwordEncoder, jwtUtils);

        Arbitro superuser = Arbitro.builder()
                .idArbitro(1L)
                .nombre("Admin")
                .apellido("Super")
                .whatsapp("9999999999")
                .contrasenia("adminPass")
                .estadoSistema(true)
                .roles(new HashSet<>(Set.of(RolUsuario.SUPERUSER)))
                .build();

        when(arbitroRepository.findByWhatsapp("9999999999")).thenReturn(superuser);

        UserDetails userDetails = userDetailsService.loadUserByUsername("9999999999");
        Set<String> authNames = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        assertTrue(authNames.contains("ROLE_SUPERUSER"));
        assertTrue(authNames.contains("ROLE_ADMIN"));
        assertTrue(authNames.contains("ROLE_PRESIDENTE"));
        assertTrue(authNames.contains("ROLE_SECRETARIO"));
        assertTrue(authNames.contains("ROLE_DESIGNADOR"));
        assertTrue(authNames.contains("ROLE_ARBITRO"));
    }

    @Test
    @DisplayName("Usuario inactivo debe ser rechazado en autenticación")
    void testUsuarioInactivoLanzaExcepcion() {
        UserDetailServiceImpl userDetailsService = new UserDetailServiceImpl(arbitroRepository, passwordEncoder, jwtUtils);

        Arbitro inactivo = Arbitro.builder()
                .idArbitro(5L)
                .whatsapp("1111111111")
                .contrasenia("pass")
                .estadoSistema(false)
                .roles(new HashSet<>(Set.of(RolUsuario.ARBITRO)))
                .build();

        when(arbitroRepository.findByWhatsapp("1111111111")).thenReturn(inactivo);

        assertThrows(DisabledException.class, () -> userDetailsService.loadUserByUsername("1111111111"));
    }

    @Test
    @DisplayName("SecurityService evalúa correctamente si es el mismo árbitro")
    void testSecurityServiceEsMismoArbitro() {
        SecurityService securityService = new SecurityService(arbitroRepository);

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(20L)
                .whatsapp("1155554444")
                .build();

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("1155554444");
        when(arbitroRepository.findById(20L)).thenReturn(Optional.of(arbitro));
        when(arbitroRepository.findById(99L)).thenReturn(Optional.empty());

        assertTrue(securityService.esMismoArbitro(authentication, 20L));
        assertFalse(securityService.esMismoArbitro(authentication, 99L));
    }

    @Test
    @DisplayName("ArbitroServiceImpl.actualizarRoles actualiza el set de roles correctamente")
    void testActualizarRolesArbitro() {
        ArbitroServiceImpl service = new ArbitroServiceImpl(
                arbitroRepository, designadosRepository, designacionRepository,
                suspencionRepository, passwordEncoder, eventPublisher, null);

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(30L)
                .nombre("Lucas")
                .apellido("Gomez")
                .whatsapp("1133332222")
                .estadoSistema(true)
                .roles(new HashSet<>(Set.of(RolUsuario.ARBITRO)))
                .build();

        when(arbitroRepository.findById(30L)).thenReturn(Optional.of(arbitro));
        when(arbitroRepository.save(any(Arbitro.class))).thenAnswer(inv -> inv.getArgument(0));

        GetArbitroDTO actualizado = service.actualizarRoles(30L, Set.of(RolUsuario.ARBITRO, RolUsuario.PRESIDENTE));

        assertNotNull(actualizado);
        assertTrue(actualizado.getRoles().contains("ARBITRO"));
        assertTrue(actualizado.getRoles().contains("PRESIDENTE"));
    }

    @Test
    @DisplayName("ArbitroServiceImpl.actualizarRoles rechaza set vacío de roles")
    void testActualizarRolesVacioLanzaExcepcion() {
        ArbitroServiceImpl service = new ArbitroServiceImpl(
                arbitroRepository, designadosRepository, designacionRepository,
                suspencionRepository, passwordEncoder, eventPublisher, null);

        Arbitro arbitro = Arbitro.builder()
                .idArbitro(30L)
                .roles(new HashSet<>(Set.of(RolUsuario.ARBITRO)))
                .build();

        when(arbitroRepository.findById(30L)).thenReturn(Optional.of(arbitro));

        assertThrows(IllegalArgumentException.class, () -> service.actualizarRoles(30L, Set.of()));
    }
}
