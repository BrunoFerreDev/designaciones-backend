package com.designaciones.webdesignaciones;


import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner init() {
        return args -> {
            System.out.println("Inicializando datos de arbitros, canchas y conceptos de gasto...");

        };
    }
}