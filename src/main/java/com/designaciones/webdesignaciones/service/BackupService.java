package com.designaciones.webdesignaciones.service;

import java.util.List;
import java.util.Map;

public interface BackupService {
    Map<String, List<Map<String, Object>>> exportJson();

    String exportSql();

    void importJson(Map<String, List<Map<String, Object>>> data);
}
