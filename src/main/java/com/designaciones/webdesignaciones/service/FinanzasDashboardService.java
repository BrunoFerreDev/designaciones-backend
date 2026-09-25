package com.designaciones.webdesignaciones.service;

import com.designaciones.webdesignaciones.dto.get.DashboardEjecutivoDTO;

public interface FinanzasDashboardService {
    DashboardEjecutivoDTO obtenerDashboardEjecutivo(Integer mes, Integer anio);
}
