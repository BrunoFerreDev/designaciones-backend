package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.dto.get.GetDesignacionDTO;
import com.designaciones.webdesignaciones.dto.post.ActualizarRolesDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetSuspencionDTO;
import com.designaciones.webdesignaciones.dto.post.ArbitroDisponibilidadDTO;
import com.designaciones.webdesignaciones.dto.post.SuspencionDTO;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.service.ArbitroService;
import com.designaciones.webdesignaciones.service.SuspencionService;
import com.designaciones.webdesignaciones.dto.get.EstadoCuentaArbitroDTO;
import com.designaciones.webdesignaciones.dto.get.GetEstadisticasArbitroDetalleDTO;
import com.designaciones.webdesignaciones.dto.post.ActualizarRolesBulkDTO;
import com.designaciones.webdesignaciones.dto.post.CambiarContraseniaDTO;
import com.designaciones.webdesignaciones.service.ArbitroCredentialService;
import com.designaciones.webdesignaciones.service.ArbitroMeService;
import com.designaciones.webdesignaciones.service.ArbitroRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping(value = "/arbitros")
@RequiredArgsConstructor
public class ArbitroController {

    private final ArbitroService arbitroService;
    private final ArbitroCredentialService arbitroCredentialService;
    private final ArbitroMeService arbitroMeService;
    private final ArbitroRoleService arbitroRoleService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<GetArbitroDTO> getMiPerfil(Authentication authentication) {
        return ResponseEntity.ok(arbitroService.getMiPerfil(authentication.getName()));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/contrasenia")
    public ResponseEntity<String> cambiarContrasenia(
            @Valid @RequestBody CambiarContraseniaDTO dto,
            Authentication authentication) {
        arbitroCredentialService.cambiarContrasenia(authentication.getName(), dto);
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/designaciones")
    public ResponseEntity<Page<GetDesignacionDTO>> getMisDesignaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.getMisDesignaciones(authentication.getName(), page, size));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/disponibilidad")
    public ResponseEntity<ArbitroDisponibilidadDTO> getMiDisponibilidad(Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.getMiDisponibilidad(authentication.getName()));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me/disponibilidad")
    public ResponseEntity<GetArbitroDTO> updateMiDisponibilidad(
            @RequestBody ArbitroDisponibilidadDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.updateMiDisponibilidad(authentication.getName(), dto));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/suspenciones")
    public ResponseEntity<Page<GetSuspencionDTO>> getMisSuspenciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.getMisSuspenciones(authentication.getName(), page, size));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me/estado-cuenta")
    public ResponseEntity<EstadoCuentaArbitroDTO> getMiEstadoCuenta(Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.getMiEstadoCuenta(authentication.getName()));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/me/estadisticas", name = "Estadísticas arbitrales del árbitro autenticado")
    public ResponseEntity<GetEstadisticasArbitroDetalleDTO> getMisEstadisticas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false, defaultValue = "DESC") String orden,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroMeService.getMisEstadisticas(authentication.getName(), inicio, fin, orden, page, size));
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PutMapping(value = "/{idArbitro}/roles", name = "Asignar roles a un arbitro")
    public ResponseEntity<GetArbitroDTO> actualizarRoles(@PathVariable Long idArbitro, @RequestBody ActualizarRolesDTO dto) {
        return ResponseEntity.ok(arbitroService.actualizarRoles(idArbitro, dto.getRoles()));
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PutMapping(value = "/{idArbitro}/rol", name = "Asignar rol individual a un arbitro")
    public ResponseEntity<GetArbitroDTO> asignarRolIndividual(@PathVariable Long idArbitro, @RequestParam RolUsuario rol) {
        return ResponseEntity.ok(arbitroService.actualizarRoles(idArbitro, java.util.Set.of(rol)));
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PutMapping(value = "/{idArbitro}/reset-contrasenia", name = "Resetear contraseña de árbitro por admin")
    public ResponseEntity<String> resetearContrasenia(@PathVariable Long idArbitro) {
        arbitroCredentialService.resetearContrasenia(idArbitro);
        return ResponseEntity.ok("Contraseña reseteada exitosamente al valor por defecto (apellido + nombre)");
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/por-rol", name = "Filtrar árbitros por rol")
    public ResponseEntity<Page<GetArbitroDTO>> getArbitrosPorRol(
            @RequestParam RolUsuario rol,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(arbitroRoleService.findByRol(rol, page, size));
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PutMapping(value = "/roles/bulk", name = "Asignación masiva de roles")
    public ResponseEntity<List<GetArbitroDTO>> actualizarRolesBulk(
            @Valid @RequestBody List<ActualizarRolesBulkDTO> dtos) {
        return ResponseEntity.ok(arbitroRoleService.actualizarRolesBulk(dtos));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PostMapping(name = "Crea un nuevo arbitro")
    public ResponseEntity<GetArbitroDTO> createArbitro(@RequestBody ArbitroDTO arbitroDTO) {
        return ResponseEntity.ok(arbitroService.createArbitro(arbitroDTO));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PutMapping(value = "/{idArbitro}", name = "Modifica un arbitro")
    public ResponseEntity<GetArbitroDTO> updateArbitro(@PathVariable Long idArbitro, @RequestBody ArbitroDTO arbitroDTO) {
        return ResponseEntity.ok(arbitroService.updateArbitro(idArbitro, arbitroDTO));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(name = "Trae todos los arbitros")
    public ResponseEntity<Page<GetArbitroDTO>> getAllArbitros(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.getAllArbitros(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/no-disponibles", name = "Traer todos los arbitros no disponibles")
    public ResponseEntity<Page<GetArbitroDTO>> getNoDisponibles(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.getNoDisponibles(page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'DESIGNADOR') or (hasRole('ARBITRO') and @securityService.esMismoArbitro(authentication, #idArbitro))")
    @PutMapping(value = "/{idArbitro}/disponibilidad", name = "Actualiza la disponibilidad de un arbitro")
    public ResponseEntity<GetArbitroDTO> updateArbitroDisponibilidad(
            @PathVariable Long idArbitro,
            @RequestBody ArbitroDisponibilidadDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroService.updateArbitroDisponibilidad(idArbitro, dto));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR')")
    @GetMapping(value = "/traer-disponibles", name = "Traer todos los arbitros disponibles")
    public ResponseEntity<Page<GetArbitroDTO>> getDisponibles(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(arbitroService.traerDisponibles(page, size));
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @DeleteMapping(value = "/{idArbitro}", name = "Elimina un arbitro")
    public ResponseEntity<String> deleteArbitro(@PathVariable Long idArbitro) {
        arbitroService.deleteArbitro(idArbitro);
        return ResponseEntity.accepted().body("Arbitro con id " + idArbitro + " eliminado correctamente");
    }

    @PreAuthorize("hasRole('SUPERUSER')")
    @PutMapping(value = "/modificar-disponibilidad-total")
    public ResponseEntity<String> modificarDisponibilidadTotal() {
        return ResponseEntity.ok(arbitroService.modificarDisponibilidadTotal());
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO', 'DESIGNADOR') or (hasRole('ARBITRO') and @securityService.esMismoArbitro(authentication, #idArbitro))")
    @GetMapping(value = "/designaciones", name = "Traer todas las designaciones de un arbitro")
    public ResponseEntity<Page<GetDesignacionDTO>> traerDesignaciones(
            @RequestParam Long idArbitro,
            @RequestParam int page,
            @RequestParam int size,
            Authentication authentication) {
        return ResponseEntity.ok(arbitroService.traerDesignacionesPorArbitro(idArbitro, page, size));
    }

    @PreAuthorize("hasAnyRole('SUPERUSER', 'PRESIDENTE', 'SECRETARIO')")
    @PutMapping("/{idArbitro}/toggle")
    public ResponseEntity<String> cambiarEstadoAbitro(@PathVariable Long idArbitro) {
        return ResponseEntity.ok(arbitroService.cambiarEstadoArbitro(idArbitro));
    }
}
