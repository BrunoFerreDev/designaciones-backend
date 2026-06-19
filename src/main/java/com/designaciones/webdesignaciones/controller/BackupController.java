package com.designaciones.webdesignaciones.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.designaciones.webdesignaciones.service.BackupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/backup")
public class BackupController {

    private final BackupService backupService;
    private final ObjectMapper objectMapper;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @GetMapping("/export/json")
    public ResponseEntity<byte[]> exportJson() {
        try {
            Map<String, List<Map<String, Object>>> data = backupService.exportJson();
            byte[] bytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(data);

            String filename = "backup_designaciones_" + getTimestamp() + ".json";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(bytes);
        } catch (IOException e) {
            log.error("Error al exportar JSON: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/sql")
    public ResponseEntity<byte[]> exportSql() {
        String sql = backupService.exportSql();
        byte[] bytes = sql.getBytes();

        String filename = "backup_designaciones_" + getTimestamp() + ".sql";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    @PostMapping("/import/json")
    public ResponseEntity<String> importJson(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Archivo vacío.");
        }
        try {
            Map<String, List<Map<String, Object>>> data = objectMapper.readValue(
                    file.getInputStream(),
                    new TypeReference<Map<String, List<Map<String, Object>>>>() {
                    }
            );
            backupService.importJson(data);
            return ResponseEntity.ok("Base de datos restaurada correctamente desde el backup.");
        } catch (Exception e) {
            log.error("Error al importar backup: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al importar base de datos: " + e.getMessage());
        }
    }

    private String getTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    }
}
