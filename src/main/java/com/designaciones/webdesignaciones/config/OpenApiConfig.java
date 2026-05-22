package com.designaciones.webdesignaciones.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Web Designaciones API")
                        .version("0.0.1")
                        .description("Documentación de la API para el proyecto Web-Designaciones"));
    }
}

