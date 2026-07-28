package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.service.DatabaseSyncService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DatabaseSyncServiceImpl implements DatabaseSyncService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSyncServiceImpl.class);

    @Value("${app.datasource.prod.url:jdbc:postgresql://localhost:5432/designaciones}")
    private String prodUrl;

    @Value("${app.datasource.prod.username:develop}")
    private String prodUsername;

    @Value("${app.datasource.prod.password:develop123}")
    private String prodPassword;

    private final DataSource activeDataSource;

    @Override
    @Transactional
    public Map<String, Object> importarSnapshotDesdeProd() {
        log.info("[SYNC PROD -> TEST] Iniciando importación directa JDBC desde DB principal ({})", prodUrl);

        DriverManagerDataSource prodDs = new DriverManagerDataSource();
        prodDs.setDriverClassName("org.postgresql.Driver");
        prodDs.setUrl(prodUrl);
        prodDs.setUsername(prodUsername);
        prodDs.setPassword(prodPassword);

        JdbcTemplate prodJdbc = new JdbcTemplate(prodDs);
        JdbcTemplate testJdbc = new JdbcTemplate(activeDataSource);

        Map<String, Object> resumen = new LinkedHashMap<>();

        // Limpiar tablas de pruebas manteniendo integridad referencial
        log.info("[SYNC PROD -> TEST] Limpiando tablas locales de pruebas...");
        try {
            testJdbc.execute("TRUNCATE TABLE designados, designacion, suspencion, tbl_aranceles, arbitro, cancha RESTART IDENTITY CASCADE");
        } catch (Exception e) {
            log.warn("[SYNC PROD -> TEST] Truncate falló, intentando borrados unitarios: {}", e.getMessage());
            testJdbc.execute("DELETE FROM designados");
            testJdbc.execute("DELETE FROM designacion");
            testJdbc.execute("DELETE FROM suspencion");
            testJdbc.execute("DELETE FROM tbl_aranceles");
            testJdbc.execute("DELETE FROM arbitro");
            testJdbc.execute("DELETE FROM cancha");
        }

        // 1. Cancha
        List<Map<String, Object>> canchas = prodJdbc.queryForList("SELECT * FROM cancha");
        int countCanchas = 0;
        for (Map<String, Object> r : canchas) {
            Object necesitaViaje = r.get("necesita_viaje");
            testJdbc.update("INSERT INTO cancha (id_cancha, nombre_cancha, categoria, fuera_de_juego, estado, necesita_viaje) VALUES (?, ?, ?, ?, ?, ?)",
                    r.get("id_cancha"), r.get("nombre_cancha"), r.get("categoria"), r.get("fuera_de_juego"), r.get("estado"),
                    necesitaViaje != null ? necesitaViaje : false);
            countCanchas++;
        }
        resumen.put("canchasImportadas", countCanchas);

        // 2. Arbitro
        List<Map<String, Object>> arbitros = prodJdbc.queryForList("SELECT * FROM arbitro");
        int countArbitros = 0;
        for (Map<String, Object> r : arbitros) {
            Object tieneAuto = r.get("tiene_auto");
            testJdbc.update("INSERT INTO arbitro (id_arbitro, nombre, apellido, whatsapp, disponible_sabado, disponible_domingo, estado_sistema, talle_short, talle_camiseta, categoria, contrasenia, tiene_auto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    r.get("id_arbitro"), r.get("nombre"), r.get("apellido"), r.get("whatsapp"),
                    r.get("disponible_sabado"), r.get("disponible_domingo"), r.get("estado_sistema"),
                    r.get("talle_short"), r.get("talle_camiseta"), r.get("categoria"), r.get("contrasenia"),
                    tieneAuto != null ? tieneAuto : false);
            countArbitros++;
        }
        resumen.put("arbitrosImportados", countArbitros);

        // 3. Suspencion
        List<Map<String, Object>> suspensiones = prodJdbc.queryForList("SELECT * FROM suspencion");
        int countSusp = 0;
        for (Map<String, Object> r : suspensiones) {
            testJdbc.update("INSERT INTO suspencion (id_suspencion, fecha_incidente, fecha_fin, fecha_registro, cantidad_dias, motivo, tipo_suspencion, id_arbitroh, id_canchah) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    r.get("id_suspencion"), r.get("fecha_incidente"), r.get("fecha_fin"), r.get("fecha_registro"),
                    r.get("cantidad_dias"), r.get("motivo"), r.get("tipo_suspencion"), r.get("id_arbitroh"), r.get("id_canchah"));
            countSusp++;
        }
        resumen.put("suspensionesImportadas", countSusp);

        // 4. Aranceles (tbl_aranceles)
        List<Map<String, Object>> aranceles = prodJdbc.queryForList("SELECT * FROM tbl_aranceles");
        int countAranceles = 0;
        for (Map<String, Object> r : aranceles) {
            testJdbc.update("INSERT INTO tbl_aranceles (id_arancel, descripcion, monto_total, fecha_vigencia, cantidad_partidos, activo, id_canchah) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    r.get("id_arancel"), r.get("descripcion"), r.get("monto_total"), r.get("fecha_vigencia"),
                    r.get("cantidad_partidos"), r.get("activo"), r.get("id_canchah"));
            countAranceles++;
        }
        resumen.put("arancelesImportados", countAranceles);

        // 5. Designaciones
        List<Map<String, Object>> designaciones = prodJdbc.queryForList("SELECT * FROM designacion ORDER BY id_designacion DESC LIMIT 100");
        int countDes = 0;
        for (Map<String, Object> r : designaciones) {
            testJdbc.update("INSERT INTO designacion (id_designacion, fecha, cantidad_partidos, etapa_campeonato, estado_designacion, detalle_extra, editable, id_canchah) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    r.get("id_designacion"), r.get("fecha"), r.get("cantidad_partidos"), r.get("etapa_campeonato"),
                    r.get("estado_designacion"), r.get("detalle_extra"), r.get("editable"), r.get("id_canchah"));
            countDes++;
        }
        resumen.put("designacionesImportadas", countDes);

        // 6. Designados
        List<Map<String, Object>> designados = prodJdbc.queryForList("SELECT * FROM designados ORDER BY id_designados DESC LIMIT 200");
        int countDesig = 0;
        for (Map<String, Object> r : designados) {
            testJdbc.update("INSERT INTO designados (id_designados, partidos_dirigidos, monto_percibido, categoria_arbitro, id_arbitroh, id_designacionh) VALUES (?, ?, ?, ?, ?, ?)",
                    r.get("id_designados"), r.get("partidos_dirigidos"), r.get("monto_percibido"),
                    r.get("categoria_arbitro"), r.get("id_arbitroh"), r.get("id_designacionh"));
            countDesig++;
        }
        resumen.put("designadosImportados", countDesig);

        // Ajustar secuencias de PostgreSQL en la DB de pruebas
        resetearSecuencias(testJdbc);

        // Aleatorizar tieneAuto y necesitaViaje para pruebas
        Map<String, Object> resumenAleatorio = aleatorizarPropiedadesViaje();
        resumen.put("randomizacionViajes", resumenAleatorio);

        log.info("[SYNC PROD -> TEST] Importación directa completada exitosamente: {}", resumen);
        return resumen;
    }

    @Override
    @Transactional
    public Map<String, Object> aleatorizarPropiedadesViaje() {
        JdbcTemplate testJdbc = new JdbcTemplate(activeDataSource);
        Random random = new Random();

        List<Long> canchaIds = testJdbc.queryForList("SELECT id_cancha FROM cancha", Long.class);
        int canchasConViaje = 0;
        for (Long id : canchaIds) {
            boolean necesita = random.nextBoolean();
            testJdbc.update("UPDATE cancha SET necesita_viaje = ? WHERE id_cancha = ?", necesita, id);
            if (necesita) canchasConViaje++;
        }

        List<Long> arbitroIds = testJdbc.queryForList("SELECT id_arbitro FROM arbitro", Long.class);
        int arbitrosConAuto = 0;
        for (Long id : arbitroIds) {
            if (Long.valueOf(35L).equals(id)) {
                testJdbc.update("UPDATE arbitro SET tiene_auto = false WHERE id_arbitro = ?", id);
                continue;
            }
            boolean tieneAuto = random.nextDouble() < 0.45; // ~45% de los árbitros con auto
            testJdbc.update("UPDATE arbitro SET tiene_auto = ? WHERE id_arbitro = ?", tieneAuto, id);
            if (tieneAuto) arbitrosConAuto++;
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalCanchas", canchaIds.size());
        res.put("canchasNecesitanViaje", canchasConViaje);
        res.put("totalArbitros", arbitroIds.size());
        res.put("arbitrosConAuto", arbitrosConAuto);
        log.info("[RANDOMIZACIÓN VIAJES] Canchas con viaje: {}/{}, Árbitros con auto: {}/{}",
                canchasConViaje, canchaIds.size(), arbitrosConAuto, arbitroIds.size());
        return res;
    }

    private void resetearSecuencias(JdbcTemplate testJdbc) {
        String[] tablas = {"cancha", "arbitro", "suspencion", "tbl_aranceles", "designacion", "designados"};
        String[] pks = {"id_cancha", "id_arbitro", "id_suspencion", "id_arancel", "id_designacion", "id_designados"};

        for (int i = 0; i < tablas.length; i++) {
            try {
                String sql = String.format(
                        "SELECT setval(pg_get_serial_sequence('%s', '%s'), COALESCE((SELECT MAX(%s) FROM %s), 1))",
                        tablas[i], pks[i], pks[i], tablas[i]
                );
                testJdbc.execute(sql);
            } catch (Exception e) {
                log.debug("No se pudo ajustar secuencia para tabla {}: {}", tablas[i], e.getMessage());
            }
        }
    }
}
