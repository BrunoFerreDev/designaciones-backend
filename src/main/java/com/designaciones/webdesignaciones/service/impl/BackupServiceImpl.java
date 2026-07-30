package com.designaciones.webdesignaciones.service.impl;

import com.designaciones.webdesignaciones.service.BackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSetMetaData;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupServiceImpl implements BackupService {

    private final JdbcTemplate jdbcTemplate;

    private static class TableInfo {
        final String name;
        final String pkColumn;

        TableInfo(String name, String pkColumn) {
            this.name = name;
            this.pkColumn = pkColumn;
        }
    }

    // Tablas ordenadas según sus dependencias de claves foráneas
    private static final List<TableInfo> TABLES_IN_ORDER = List.of(
            new TableInfo("caja", "id_caja"),
            new TableInfo("concepto_gasto", "id_concepto_gasto"),
            new TableInfo("arbitro", "id_arbitro"),
            new TableInfo("cancha", "id_cancha"),
            new TableInfo("tbl_aranceles", "id_arancel"),
            new TableInfo("designacion", "id_designacion"),
            new TableInfo("suspencion", "id_suspencion"),
            new TableInfo("prestamo", "id_prestamo"),
            new TableInfo("designados", "id_designados"),
            new TableInfo("transacciones", "id_transaccion"),
            new TableInfo("transacciones_gasto", "id_transaccion"),
            new TableInfo("pagos_prestamo", "id_transaccion"),
            new TableInfo("deudas_gasto", "id_deuda"),
            new TableInfo("transacciones_recupero", "id_transaccion")
    );

    @Override
    public Map<String, List<Map<String, Object>>> exportJson() {
        Map<String, List<Map<String, Object>>> backup = new LinkedHashMap<>();
        for (TableInfo table : TABLES_IN_ORDER) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + table.name);
                backup.put(table.name, rows);
            } catch (Exception e) {
                log.error("Error al exportar tabla {}: {}", table.name, e.getMessage());
            }
        }
        return backup;
    }

    @Override
    public String exportSql() {
        StringBuilder sql = new StringBuilder();
        sql.append("-- ========================================================\n");
        sql.append("-- BACKUP SISTEMA DE DESIGNACIONES ARBITRALES\n");
        sql.append("-- Generado el: ").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        sql.append("-- ========================================================\n\n");

        // Desactivar restricciones temporalmente si es PostgreSQL
        sql.append("SET CONSTRAINTS ALL DEFERRED;\n\n");

        // Limpieza de datos en orden inverso
        sql.append("-- LIMPIEZA DE DATOS EXISTENTES\n");
        for (int i = TABLES_IN_ORDER.size() - 1; i >= 0; i--) {
            sql.append("DELETE FROM ").append(TABLES_IN_ORDER.get(i).name).append(";\n");
        }
        sql.append("\n");

        // Inserción de datos en orden
        sql.append("-- INSERCIÓN DE DATOS\n");
        for (TableInfo table : TABLES_IN_ORDER) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + table.name);
                if (rows.isEmpty()) {
                    continue;
                }
                sql.append("-- Tabla: ").append(table.name).append("\n");
                for (Map<String, Object> row : rows) {
                    List<String> columns = new ArrayList<>(row.keySet());
                    String colString = String.join(", ", columns);
                    String valString = columns.stream()
                            .map(col -> formatValueForSql(row.get(col)))
                            .collect(Collectors.joining(", "));
                    sql.append("INSERT INTO ").append(table.name)
                            .append(" (").append(colString).append(") VALUES (")
                            .append(valString).append(");\n");
                }
                sql.append("\n");
            } catch (Exception e) {
                log.error("Error al generar SQL para tabla {}: {}", table.name, e.getMessage());
                sql.append("-- ERROR exportando tabla ").append(table.name).append(": ").append(e.getMessage()).append("\n\n");
            }
        }

        // Reiniciar secuencias de PostgreSQL
        sql.append("-- REINICIO DE SECUENCIAS (PostgreSQL)\n");
        for (TableInfo table : TABLES_IN_ORDER) {
            sql.append("SELECT setval(coalesce(pg_get_serial_sequence('").append(table.name).append("', '").append(table.pkColumn)
                    .append("'), '").append(table.name).append("_").append(table.pkColumn).append("_seq'), ")
                    .append("coalesce((SELECT max(").append(table.pkColumn).append(") FROM ").append(table.name).append("), 1) + 1, false);\n");
        }

        return sql.toString();
    }

    @Override
    @Transactional
    public void importJson(Map<String, List<Map<String, Object>>> data) {
        log.info("Iniciando restauración de base de datos desde backup JSON.");

        // 1. Limpieza en orden inverso
        for (int i = TABLES_IN_ORDER.size() - 1; i >= 0; i--) {
            String tableName = TABLES_IN_ORDER.get(i).name;
            try {
                jdbcTemplate.update("DELETE FROM " + tableName);
                log.debug("Tabla {} vaciada.", tableName);
            } catch (Exception e) {
                log.error("Error al vaciar tabla {}: {}", tableName, e.getMessage());
                throw new RuntimeException("Error al vaciar tabla " + tableName + " para importación", e);
            }
        }

        // 2. Inserción en orden de dependencias
        for (TableInfo table : TABLES_IN_ORDER) {
            List<Map<String, Object>> rows = data.get(table.name);
            if (rows == null || rows.isEmpty()) {
                log.info("Tabla {}: sin datos para importar", table.name);
                continue;
            }

            log.info("Importando {} registros en tabla {}", rows.size(), table.name);

            // Obtener metadatos de tipos de columnas para conversión precisa
            Map<String, Integer> columnTypes = getColumnTypes(table.name);

            for (Map<String, Object> row : rows) {
                List<String> columns = new ArrayList<>(row.keySet());
                String colString = String.join(", ", columns);
                String placeholders = columns.stream().map(c -> "?").collect(Collectors.joining(", "));
                String insertSql = "INSERT INTO " + table.name + " (" + colString + ") VALUES (" + placeholders + ")";

                Object[] args = new Object[columns.size()];
                for (int idx = 0; idx < columns.size(); idx++) {
                    String col = columns.get(idx);
                    Object val = row.get(col);
                    Integer type = columnTypes.get(col.toLowerCase());
                    args[idx] = convertValueToType(val, type != null ? type : Types.VARCHAR);
                }

                try {
                    jdbcTemplate.update(insertSql, args);
                } catch (Exception e) {
                    log.error("Error al insertar fila en {}. SQL: {}, Valores: {}, Error: {}",
                            table.name, insertSql, Arrays.toString(args), e.getMessage());
                    throw new RuntimeException("Error importando fila en " + table.name + ": " + e.getMessage(), e);
                }
            }
        }

        // 3. Reiniciar secuencias en PostgreSQL
        log.info("Reiniciando secuencias de claves primarias.");
        for (TableInfo table : TABLES_IN_ORDER) {
            try {
                String seqCheck = "SELECT pg_get_serial_sequence(?, ?)";
                String seqName = jdbcTemplate.queryForObject(seqCheck, String.class, table.name, table.pkColumn);
                if (seqName != null) {
                    String resetSql = "SELECT setval(?, COALESCE((SELECT max(" + table.pkColumn + ") FROM " + table.name + "), 1) + 1, false)";
                    jdbcTemplate.queryForObject(resetSql, Long.class, seqName);
                    log.debug("Secuencia {} reiniciada.", seqName);
                }
            } catch (Exception e) {
                log.warn("No se pudo reiniciar secuencia para tabla {}. Error: {}", table.name, e.getMessage());
            }
        }

        log.info("Restauración de base de datos finalizada con éxito.");
    }

    private Map<String, Integer> getColumnTypes(String tableName) {
        Map<String, Integer> types = new HashMap<>();
        try {
            jdbcTemplate.query("SELECT * FROM " + tableName + " LIMIT 0", rs -> {
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                for (int i = 1; i <= columnCount; i++) {
                    types.put(metaData.getColumnName(i).toLowerCase(), metaData.getColumnType(i));
                }
                return null;
            });
        } catch (Exception e) {
            log.error("Error obteniendo metadatos para {}: {}", tableName, e.getMessage());
        }
        return types;
    }

    private Object convertValueToType(Object val, int sqlType) {
        if (val == null) return null;
        String strVal = val.toString();
        if (strVal.trim().isEmpty()) {
            if (sqlType == Types.DATE || sqlType == Types.TIMESTAMP || sqlType == Types.NUMERIC
                    || sqlType == Types.DECIMAL || sqlType == Types.INTEGER || sqlType == Types.BIGINT) {
                return null;
            }
        }

        switch (sqlType) {
            case Types.DATE:
                if (val instanceof String) {
                    return LocalDate.parse(((String) val).substring(0, 10));
                } else if (val instanceof Number) {
                    return LocalDate.ofInstant(java.time.Instant.ofEpochMilli(((Number) val).longValue()), java.time.ZoneId.systemDefault());
                }
                break;
            case Types.TIMESTAMP:
            case Types.TIMESTAMP_WITH_TIMEZONE:
                if (val instanceof String) {
                    String s = (String) val;
                    s = s.replace("T", " ");
                    if (s.length() > 19) {
                        s = s.substring(0, 19);
                    }
                    try {
                        return LocalDateTime.parse(s.replace(" ", "T"));
                    } catch (Exception e) {
                        return java.sql.Timestamp.valueOf(s);
                    }
                } else if (val instanceof Number) {
                    return LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(((Number) val).longValue()), java.time.ZoneId.systemDefault());
                }
                break;
            case Types.DECIMAL:
            case Types.NUMERIC:
                if (val instanceof String || val instanceof Number) {
                    return new BigDecimal(strVal);
                }
                break;
            case Types.INTEGER:
                if (val instanceof Number) {
                    return ((Number) val).intValue();
                } else if (val instanceof String) {
                    return Integer.parseInt(strVal);
                }
                break;
            case Types.BIGINT:
                if (val instanceof Number) {
                    return ((Number) val).longValue();
                } else if (val instanceof String) {
                    return Long.parseLong(strVal);
                }
                break;
            case Types.BOOLEAN:
            case Types.BIT:
                if (val instanceof Boolean) {
                    return val;
                } else if (val instanceof String) {
                    return Boolean.parseBoolean(strVal) || "1".equals(strVal);
                } else if (val instanceof Number) {
                    return ((Number) val).intValue() != 0;
                }
                break;
        }
        return val;
    }

    private String formatValueForSql(Object val) {
        if (val == null) {
            return "NULL";
        }
        if (val instanceof Boolean) {
            return (Boolean) val ? "TRUE" : "FALSE";
        }
        if (val instanceof Number) {
            return val.toString();
        }
        if (val instanceof java.sql.Date || val instanceof java.time.LocalDate) {
            return "'" + val.toString() + "'";
        }
        if (val instanceof java.sql.Timestamp || val instanceof java.time.LocalDateTime || val instanceof java.time.Instant) {
            return "'" + val.toString().replace("T", " ").substring(0, 19) + "'";
        }
        String str = val.toString();
        str = str.replace("'", "''");
        return "'" + str + "'";
    }
}
