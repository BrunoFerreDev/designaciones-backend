package com.designaciones.webdesignaciones.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.designaciones.webdesignaciones.record.AuthLogin;
import com.designaciones.webdesignaciones.record.AuthResponse;
import com.designaciones.webdesignaciones.security.UserDetailServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;

@RestController
@RequestMapping(value = "/auth")
@RequiredArgsConstructor
public class LoginController {
    private final UserDetailServiceImpl userDetailsService;

    @PostMapping("/login")
    @Operation(summary = "1. Iniciar Sesión", description = "Devuelve el JWT Token para usar en el botón Authorize")
    // 2. Descripción clara
    public ResponseEntity<AuthResponse> login(@RequestBody AuthLogin login) {
        AuthResponse response = userDetailsService.loginUser(login);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "2. Cerrar la sesion", description = "Limpiar el security context para el jwt")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Decodificamos sin verificar (porque si ya expiró no importa, pero si es válido lo bloqueamos)
                DecodedJWT jwt = JWT.decode(token);
                userDetailsService.logout();
                return ResponseEntity.ok("Sesión cerrada correctamente");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error al procesar el cierre de sesión");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
