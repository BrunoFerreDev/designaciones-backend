package com.designaciones.webdesignaciones;


import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner init(ArbitroRepository arbitroRepository, CanchaRepository canchaRepository) {
        return args -> {
            System.out.println("Inicializando datos de arbitros, canchas y conceptos de gasto...");
            if (arbitroRepository.count() == 0) {
                List<Arbitro> arbitroList = List.of(
                        new Arbitro("Alberto", "Gauto", "X", "X", "+5493743451023"),
                        new Arbitro("Almirón", "Oscar", "XL", "XL", "+5493743892314"),
                        new Arbitro("Arias", "Silvestre", "L", "L", "+5493743764589"),
                        new Arbitro("Argüello", "Andrea", "M", "M", "+5493743238945"),
                        new Arbitro("Barboza", "Diego", "L", "L", "+5493743901276"),
                        new Arbitro("Benítez", "Juan", "XL", "XL", "+5493743567812"),
                        new Arbitro("Bogado", "Hugo", "L", "L", "+5493743349012"),
                        new Arbitro("Brítez", "Alberto", "XL", "XL", "+5493743812390"),
                        new Arbitro("Brítez", "Dario", "XXXL", "XXL", "+5493743109283"),
                        new Arbitro("Britos", "Javier", null, null, "+5493743675421"),
                        new Arbitro("Días", "Juan Carlos", "X", "X", "+5493743948572"),
                        new Arbitro("Espínola", "Belen", "M", "M", "+5493743210984"),
                        new Arbitro("Espinola", "Pablo", "L", "L", "+5493743456789"),
                        new Arbitro("Ferreira", "Bruno", "XL", "L", "+5493743614796"),
                        new Arbitro("Ferreira", "Ramón", "XL", "XL", "+5493743543210"),
                        new Arbitro("Ferreyra", "German", "XL", "XL", "+5493743192837"),
                        new Arbitro("Gauto", "Ramón", "M", "M", "+5493743738291"),
                        new Arbitro("Lovera", "Andrés", "XL", "L", "+5493743283746"),
                        new Arbitro("Marocheski", "Griselda", "M", "M", "+5493743647582"),
                        new Arbitro("Mora", "Luciana", "L", "L", "+5493743918273"),
                        new Arbitro("Morel", "Ramón", "XL", "XL", "+5493743374859"),
                        new Arbitro("Nimeth", "Pablo", "XXL", "XXL", "+5493743829104"),
                        new Arbitro("Palacios", "Sérgio", "L", "L", "+5493743501928"),
                        new Arbitro("Rivas", "Jorge", "XL", "XL", "+5493743758493"),
                        new Arbitro("Silvero", "Oscar", "XL", "L", "+5493743162738"),
                        new Arbitro("Silvero", "Yoselin", "L", "M", "+5493743495867"),
                        new Arbitro("Sosa", "Valeria", "S", "S", "+5493743604958"),
                        new Arbitro("Vázquez", "Roberto", "L", "L", "+5493743837465"),
                        new Arbitro("Villalba", "Diego", "XXL", "XXL", "+5493743293847"));
                for (Arbitro a : arbitroList) {
                    a.setCategoria(CategoriaArbitro.INICIAL);
                    a.setContrasenia(passwordEncoder.encode("123456"));
                }
                arbitroRepository.saveAllAndFlush(arbitroList);
            }
            if (canchaRepository.count() == 0) {
                List<Cancha> canchas = List.of(
                        new Cancha("Master de Jardín", Categoria.FUTBOL_11, false, true),
                        new Cancha("Master de Santo Pipó", Categoria.FUTBOL_10, false, true),
                        new Cancha("PapiFutbol Santo Pipó", Categoria.FUTBOL_9, false, true),
                        new Cancha("Veteranos Corpus", Categoria.FUTBOL_10, false, true),
                        new Cancha("Capilla", Categoria.FUTBOL_9, false, true),
                        new Cancha("Independiente", Categoria.FUTBOL_9, false, true),
                        new Cancha("Predio Nuevo", Categoria.FUTBOL_9, false, true),
                        new Cancha("Oasis", Categoria.FUTBOL_11, true, true));
                canchaRepository.saveAllAndFlush(canchas);
            }
        };
    }
}