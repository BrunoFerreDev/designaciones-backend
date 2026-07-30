package com.designaciones.webdesignaciones.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class CustomLogoutHandler implements LogoutHandler {

    private final JwtUtils jwtService;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        jwt = authHeader.substring(7);
        try {
            DecodedJWT decodedJWT = jwtService.validarToken(jwt);
            Date expirationDate = jwtService.extraerExpiracion(decodedJWT);
            // Limpiamos el contexto de seguridad de Spring
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            // Si el token es malforme o ya expiró, simplemente limpiamos el contexto
            SecurityContextHolder.clearContext();
        }
    }
}
