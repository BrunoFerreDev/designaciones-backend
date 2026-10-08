package com.designaciones.webdesignaciones.service;

/**
 * Interfaz compuesta de Finanzas para mantener compatibilidad hacia atrás (LSP).
 * Hereda de las interfaces segregadas de dominio:
 * - PrestamoService
 * - GastoService
 * - CajaService
 * - TransaccionService
 * - RecuperoGastoService
 */
public interface FinanzasService extends
        PrestamoService,
        GastoService,
        CajaService,
        TransaccionService,
        RecuperoGastoService {
}
