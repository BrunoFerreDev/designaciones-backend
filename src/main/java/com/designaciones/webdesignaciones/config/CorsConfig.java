package com.designaciones.webdesignaciones.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todos los endpoints (incluyendo /api/arbitros y /api/canchas)
                .allowedOrigins(
                        "http://localhost:5174",
                        "http://localhost:5173",
                        "http://localhost:5500",
                        "http://localhost:5501",
                        "http://127.0.0.1:5500", // <-- Agregar este
                        "http://127.0.0.1:5501"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
