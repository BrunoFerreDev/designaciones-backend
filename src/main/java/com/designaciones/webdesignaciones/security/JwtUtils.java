package com.designaciones.webdesignaciones.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.utils.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtUtils {
    @Value("${security.jwt.private.key}")
    private String privatekey;
    @Value("${security.jwt.private.user.generator}")
    private String userGenerator;

    @Value("${security.jwt.private.user.phone}")
    private String phone;

    private final ArbitroRepository arbitroRepository;

    public String crearToken(Authentication authentication, String whatsapp) {
        Algorithm algorithm = Algorithm.HMAC256(this.privatekey);
        Arbitro persona = arbitroRepository.findByWhatsapp(whatsapp);
        if (persona == null) {
            throw new NotFoundException("Error al iniciar");
        }
        if (!persona.getWhatsapp().equalsIgnoreCase(this.phone)) {
            throw new NotFoundException("Error al iniciar, número de teléfono incorrecto o no autorizado");
        }
        String autorizaciones = "ROLE_ADMIN";

        return JWT.create()
                .withIssuer(this.userGenerator)
                .withSubject(whatsapp)
                .withClaim("authorities", autorizaciones)
                .withClaim("apellido", persona.getApellido())
                .withIssuedAt(new Date())
                //Expiracion : 2 horas (2 * 60 * 60 * 1000 milisegundos)
                //.withExpiresAt(new Date(System.currentTimeMillis() + (2 * 60 * 60 * 1000)))
                // Expiración: 30 minutos (30 * 60 * 1000 milisegundos)
                .withExpiresAt(new Date(System.currentTimeMillis() + (30 * 60 * 1000)))
                .withNotBefore(new Date(System.currentTimeMillis()))
                .withJWTId(UUID.randomUUID().toString())
                .sign(algorithm);
    }

    public DecodedJWT validarToken(String token) throws JWTVerificationException {
        try {
            DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC256(this.privatekey))
                    .withIssuer(this.userGenerator)
                    .build()
                    .verify(token);
            return decodedJWT;
        } catch (JWTVerificationException e) {
            throw new JWTVerificationException("TOKEN INVALIDO O EXPIRADO");
        }
    }

    public String traerClaimEspecifico(DecodedJWT decodedJWT, String claimName) {
        if (decodedJWT.getClaim(claimName) != null && !decodedJWT.getClaim(claimName).isNull()) {
            return decodedJWT.getClaim(claimName).asString();
        } else {
            return "ERROR AL DECODIFICAR EL CLAIM";
        }

    }

    public String extraerWhatsApp(DecodedJWT decodedJWT) {
        return decodedJWT.getSubject();
    }

    public String extraerNombre(DecodedJWT decodedJWT) {
        return decodedJWT.getClaim("nombre").asString();
    }


    public Date extraerExpiracion(DecodedJWT decodedJWT) {
        return decodedJWT.getExpiresAt();
    }
}
