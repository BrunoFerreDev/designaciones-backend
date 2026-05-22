package com.designaciones.webdesignaciones;

import com.designaciones.webdesignaciones.model.Arbitro;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class GeneradorNumeros {
    public static void asignarNumerosAleatorios(List<Arbitro> arbitros) {
        Set<String> numerosUsados = new HashSet<>();
        Random random = new Random();

        for (Arbitro arbitro : arbitros) {
            String numeroGenerado;
            do {
                // Genera el sufijo de 6 dígitos aleatorios
                int sufijo = 100000 + random.nextInt(900000);
                numeroGenerado = "+5493743" + sufijo;
            } while (numerosUsados.contains(numeroGenerado)); // Vuelve a intentar si ya existe

            numerosUsados.add(numeroGenerado);
            arbitro.setWhatsapp(numeroGenerado); // Asumiendo que tu entidad JPA tiene este setter
        }
    }
}
