package com.designaciones.webdesignaciones;

import com.designaciones.webdesignaciones.dto.ArbitroDTO;
import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class WebDesignacionesApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebDesignacionesApplication.class, args);
    }


}
