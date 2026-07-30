package com.designaciones.webdesignaciones.service;

import java.util.Map;

public interface DatabaseSyncService {

    Map<String, Object> importarSnapshotDesdeProd();

    Map<String, Object> aleatorizarPropiedadesViaje();

}
