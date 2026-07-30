Hola! Necesito automatizar un flujo de tareas programadas y eventos en mi API REST de Java con Spring Boot. 

Actualmente, las funciones y reglas de negocio de designación de árbitros y disponibilidad ya existen y funcionan mediante endpoints REST, pero quiero que todo el proceso funcione de forma automática siguiendo este cronograma:

---

### 1. OBJETIVOS Y CRONOGRAMA DEL FLUJO AUTOMÁTICO

1. **Viernes a las 21:00 hs (Fase 1 - Generación Base):**
   - Disparar automáticamente la creación de las designaciones para el fin de semana, tomando como base la fecha anterior.
   - Usar un `@Scheduled` con cron para ejecutarse todos los viernes a las 21:00 hs (Zona horaria: America/Argentina/Buenos_Aires).

2. **Viernes de 21:00 hs a 23:30 hs (Fase 2 - Asignación Reactiva Progresiva):**
   - Durante este rango de tiempo, a medida que los árbitros confirmen su disponibilidad (para sábado o domingo), el sistema debe intentar asignarlos inmediatamente a un partido de la fecha recién creada.
   - La asignación debe invocar la lógica y reglas de negocio ya existentes en el proyecto (ej. validación de categoría, restricción de no repetir cancha etc.).
   - Otra regla, es que si el arbitro tiene una suspencion activa y no cumplida, designarlo unicamente si se necesitan asignar arbitros a alguna designacion, siempre y cuando no se le asigne a una cancha donde estar suspendido.
   
3. **Viernes a las 23:30 hs (Fase 3 - Cierre y Barrido Final):**
   - Ejecutar una tarea programada a las 23:30 hs para cerrar la ventana de recepción/asignación automática, ejecutar un barrido final de asignación si quedaron pendientes y reportar/loguear los partidos que hayan quedado sin árbitro asignado para revisión manual.

---

### 2. REQUERIMIENTOS TÉCNICOS A IMPLEMENTAR

- **Habilitar Scheduling y Asincronía:** Configurar `@EnableScheduling` y `@EnableAsync` en la aplicación.
- **Componente Scheduler (`DesignacionScheduler`):** 
  - Crear un componente Spring con los métodos `@Scheduled` correspondientes para las 21:00 hs y las 23:30 hs del viernes.
  - Reutilizar las llamadas a los `@Service` existentes sin duplicar lógica de negocio.
- **Enfoque Basado en Eventos / Listener:**
  - Cuando se marque o guarde la disponibilidad de un árbitro, publicar un evento de Spring (`ArbitroDisponibleEvent`) o invocar en segundo plano (`@Async`) la lógica de evaluación.
  - Verificar que si la marcación ocurre dentro de la ventana de 21:00 a 23:30 hs del viernes, se ejecute la asignación automática progresiva evaluando las reglas existentes.
- **Configuración de Perfiles de Prueba (Opcional pero recomendado):**
  - Facilitar un parámetro de configuración (o endpoint interno de dev) para simular el disparo de los schedulers sin tener que esperar a las 21:00 hs del viernes durante la etapa de pruebas.

---

### 3. TAREAS A REALIZAR POR EL ASISTENTE

1. Revisa la estructura de controladores y servicios existentes en el proyecto relacionados con `Designacion` y `Disponibilidad`.
2. Crea los componentes necesarios (`Scheduler`, `Events`, `Listeners`) conectándolos a las funciones actuales.
3. Asegúrate de incluir anotaciones de transaccionalidad (`@Transactional`) donde corresponda y manejo limpio de logs para auditoría.

Por favor, revisa el proyecto y procede con los cambios paso a paso o propone la refactorización necesaria.