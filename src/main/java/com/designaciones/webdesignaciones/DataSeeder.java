package com.designaciones.webdesignaciones;


import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner init(ArbitroRepository arbitroRepository) {
        return args -> {
            System.out.println("Inicializando datos de arbitros, canchas y conceptos de gasto...");
            for (Arbitro a : arbitroRepository.findAll()) {
                /*a.setDisponibleDomingo(false);*/
                a.setDisponibleSabado(true);
                arbitroRepository.save(a);
                System.out.println("Arbitro " + a.getNombre() + " " + a.getApellido() + " actualizado.");
            }
        };
    }
}