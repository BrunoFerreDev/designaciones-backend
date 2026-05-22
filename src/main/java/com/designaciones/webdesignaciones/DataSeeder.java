package com.designaciones.webdesignaciones;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.model.Cancha;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import com.designaciones.webdesignaciones.repository.CanchaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Random;
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner init(ArbitroRepository arbitroRepository, CanchaRepository canchaRepository) {
        return args -> {
            if (arbitroRepository.count() == 0) {
                // Instanciamos Random para generar los valores aleatorios
                Random random = new Random();
                CategoriaArbitro[] categorias = CategoriaArbitro.values();

                List<Arbitro> arbitros = List.of(new Arbitro("Alberto", "Gauto", "X", "X"), new Arbitro("Almirón", "Oscar", "XL", "XL"), new Arbitro("Arias", "Silvestre", "L", "L"), new Arbitro("Argüello", "Andrea", "M", "M"), new Arbitro("Barboza", "Diego", "L", "L"), new Arbitro("Benítez", "Juan", "XL", "XL"), new Arbitro("Bogado", "Hugo", "L", "L"), new Arbitro("Brítez", "Alberto", "XL", "XL"), new Arbitro("Brítez", "Dario", "XXXL", "XXL"), new Arbitro("Britos", "Javier", "XL", "L"), new Arbitro("Días", "Juan Carlos", "X", "X"), new Arbitro("Espínola", "Belen", "M", "M"), new Arbitro("Espinola", "Pablo", "L", "L"), new Arbitro("Ferreira", "Bruno", "XL", "L"), new Arbitro("Ferreira", "Ramón", "XL", "XL"), new Arbitro("Ferreyra", "German", "XL", "XL"), new Arbitro("Gauto", "Ramón", "M", "M"), new Arbitro("Lovera", "Andrés", "XL", "L"), new Arbitro("Marocheski", "Griselda", "M", "M"), new Arbitro("Mora", "Luciana", "L", "L"), new Arbitro("Morel", "Ramón", "XL", "XL"), new Arbitro("Nimeth", "Pablo", "XXL", "XXL"), new Arbitro("Palacios", "Sergio", "L", "L"), new Arbitro("Rivas", "Jorge", "XL", "XL"), new Arbitro("Silvero", "Oscar", "XL", "L"), new Arbitro("Silvero", "Yoselin", "L", "M"), new Arbitro("Sosa", "Valeria", "S", "S"), new Arbitro("Vázquez", "Roberto", "L", "L"), new Arbitro("Villalba", "Diego", "XXL", "XXL"));

                // Recorremos la lista y asignamos una categoría aleatoria a cada árbitro
                for (Arbitro arbitro : arbitros) {
                    CategoriaArbitro categoriaAleatoria = categorias[random.nextInt(categorias.length)];
                    arbitro.setCategoria(categoriaAleatoria); // Asegúrate de tener este setter en tu entidad
                    arbitro.setDisponibilidad(true);
                    arbitro.setEstadoSistema(true);
                }

                arbitroRepository.saveAll(arbitros);
            }
            if (canchaRepository.count() == 0) {
                List<Cancha> canchas = List.of(new Cancha(null, "Master Jardin", Categoria.FUTBOL_11, false, true, null), new Cancha(null, "Master Santo Pipo", Categoria.FUTBOL_9, false, true, null), new Cancha(null, "Papifutbol Santo Pipo", Categoria.FUTBOL_9, false, true, null), new Cancha(null, "Veteranos Corpus", Categoria.FUTBOL_9, false, true, null));
                canchaRepository.saveAll(canchas);
            }
           /* List<Arbitro> arbitros = arbitroRepository.findAll();
            GeneradorNumeros.asignarNumerosAleatorios(arbitros);
            arbitroRepository.saveAll(arbitros);*/
        };
    }
}