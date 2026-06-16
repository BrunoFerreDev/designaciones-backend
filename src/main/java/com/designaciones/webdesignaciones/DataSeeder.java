package com.designaciones.webdesignaciones;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.model.*;
import com.designaciones.webdesignaciones.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner init(ArbitroRepository arbitroRepository, CanchaRepository canchaRepository, ConceptoGastoRepository conceptoGastoRepository, CajaRepository cajaRepository, TransaccionRepository transaccionRepository, PrestamoRepository prestamoRepository, ArancelRepo arancelRepo) {
        return args -> {
            System.out.println("Inicializando datos de arbitros, canchas y conceptos de gasto...");
           /* for (Cancha cancha : canchaRepository.findAll()){
                ArancelArbitral arancelArbitral = new ArancelArbitral();
                arancelArbitral.setCancha(cancha);
                arancelArbitral.setActivo(true);
                arancelArbitral.setCantidadPartidos(0);
                arancelArbitral.setDescripcion("Sin descripcion");
                arancelArbitral.setFechaVigencia(LocalDate.now().plusMonths(2));
                arancelArbitral.setMontoTotal(new BigDecimal("0.00"));
                arancelRepo.save(arancelArbitral);
            }*/
            /*Caja caja = new Caja();
            caja.setActivo(true);
            caja.setNombre("Caja Principal");
            caja.setSaldoActual(new BigDecimal("10000.00"));
            caja.setAnio(LocalDate.now().getYear());
            cajaRepository.save(caja);
            for (Transaccion t : transaccionRepository.findAll()) {
                t.setCaja(caja);
                transaccionRepository.save(t);
            }*/
        };
          /*if (arbitroRepository.count() == 0) {
                Random random = new Random();
                CategoriaArbitro[] categorias = CategoriaArbitro.values();
                List<Arbitro> arbitros = List.of(new Arbitro("Alberto", "Gauto", "X", "X"), new Arbitro("Almirón", "Oscar", "XL", "XL"), new Arbitro("Arias", "Silvestre", "L", "L"), new Arbitro("Argüello", "Andrea", "M", "M"), new Arbitro("Barboza", "Diego", "L", "L"), new Arbitro("Benítez", "Juan", "XL", "XL"), new Arbitro("Bogado", "Hugo", "L", "L"), new Arbitro("Brítez", "Alberto", "XL", "XL"), new Arbitro("Brítez", "Dario", "XXXL", "XXL"), new Arbitro("Britos", "Javier", "XL", "L"), new Arbitro("Días", "Juan Carlos", "X", "X"), new Arbitro("Espínola", "Belen", "M", "M"), new Arbitro("Espinola", "Pablo", "L", "L"), new Arbitro("Ferreira", "Bruno", "XL", "L"), new Arbitro("Ferreira", "Ramón", "XL", "XL"), new Arbitro("Ferreyra", "German", "XL", "XL"), new Arbitro("Gauto", "Ramón", "M", "M"), new Arbitro("Lovera", "Andrés", "XL", "L"), new Arbitro("Marocheski", "Griselda", "M", "M"), new Arbitro("Mora", "Luciana", "L", "L"), new Arbitro("Morel", "Ramón", "XL", "XL"), new Arbitro("Nimeth", "Pablo", "XXL", "XXL"), new Arbitro("Palacios", "Sergio", "L", "L"), new Arbitro("Rivas", "Jorge", "XL", "XL"), new Arbitro("Silvero", "Oscar", "XL", "L"), new Arbitro("Silvero", "Yoselin", "L", "M"), new Arbitro("Sosa", "Valeria", "S", "S"), new Arbitro("Vázquez", "Roberto", "L", "L"), new Arbitro("Villalba", "Diego", "XXL", "XXL"));

                for (Arbitro arbitro : arbitros) {
                    CategoriaArbitro categoriaAleatoria = categorias[random.nextInt(categorias.length)];
                    arbitro.setCategoria(categoriaAleatoria); // Asegúrate de tener este setter en tu entidad
                    arbitro.setDisponibilidad(true);
                    arbitro.setEstadoSistema(true);
                }

                arbitroRepository.saveAll(arbitros);
            }

            if (conceptoGastoRepository.count() == 0) {
                List<ConceptoGasto> conceptos = List.of(
                        // --- EGRESOS COMUNES ---
                        new ConceptoGasto("Combustible / Viáticos", "Gastos de traslado ."), new ConceptoGasto("Cena / Agasajo ", "Gastos destinados a celebraciones, reuniones sociales o la cena anual del grupo."), new ConceptoGasto("Indumentaria y Equipamiento", "Compra de tarjetas, silbatos, planillas, indumentaria oficial, banderines o intercomunicadores."), new ConceptoGasto("Capacitación y Cursos", "Pago a instructores, material didáctico, alquiler de salones o cursos de actualización de reglas de juego."), new ConceptoGasto("Insumos de Oficina y Administración", "Gastos en papelería, impresiones, fotocopias de planillas de votación o mantenimiento del espacio del grupo."), new ConceptoGasto("Ayuda Social / Fondo de Emergencia", "Dinero destinado a colaborar con algún miembro del grupo por cuestiones de salud, lesiones o fuerza mayor."),

                        // --- INGRESOS / RECUPERACIONES ---
                        new ConceptoGasto("Recuperación de Viáticos", "Ingreso por la devolución o reintegro del dinero adelantado para combustible o pasajes de viajes."),

                        new ConceptoGasto("Donaciones / Patrocinios", "Ingresos externos provenientes de marcas, publicidad en las camisetas o aportes extraordinarios de terceros."));
                conceptoGastoRepository.saveAll(conceptos);
            }
        };
    }*/
    }

    ;
}