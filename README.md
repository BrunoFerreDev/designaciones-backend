# Sistema de Designaciones Arbitrales - Backend

API REST desarrollada en **Spring Boot** para la gestión integral de un sistema de designaciones arbitrales, que incluye la administración de árbitros, canchas, designaciones (manuales y automáticas a demanda), eventos reactivos, gestión financiera (gastos, préstamos, recuperos) y control de suspensiones.

## 🚀 Tecnologías Utilizadas

- **Java 21/25**
- **Spring Boot 3.x / 4.x**
  - Spring Web MVC (API REST)
  - Spring Data JPA (Persistencia de datos)
  - Spring Security (Encriptación de contraseñas y control de accesos)
  - Spring Boot Actuator (Monitoreo)
  - Spring HATEOAS
  - Eventos de Aplicación (`@TransactionalEventListener`, `@Async`)
- **PostgreSQL** (Base de datos principal)
- **Lombok** (Reducción de código repetitivo)
- **Springdoc OpenAPI / Swagger UI** (Documentación interactiva de la API)
- **JasperReports** (Generación de reportes PDF)
- **Maven** (Gestión de dependencias y construcción)

---

## 🛠️ Arquitectura y Estructura del Proyecto

El proyecto sigue una arquitectura en capas:
- **`controller`**: Controladores REST que exponen los endpoints (`ArbitroController`, `DesignacionController`, `GastosController`, `AutomationController`, etc.).
- **`service`**: Lógica de negocio transaccional. Separación de interfaces (`ArbitroService`, `DesignacionService`, etc.) y sus implementaciones (`impl`).
- **`repository`**: Repositorios Spring Data JPA con consultas JPQL optimizadas y soporte de paginación.
- **`model`**: Entidades JPA (`Arbitro`, `Designacion`, `Designados`, `Cancha`, `Suspencion`, `Gasto`, etc.).
- **`dto`**: Data Transfer Objects separados para lectura (`get`) y escritura (`post`).
- **`event`**: Eventos asíncronos y desacoplados (`ArbitroNoDisponibleEvent`, `ArbitroDisponibleEvent`, listeners).
- **`scheduler`**: Componentes para tareas programadas (actualmente pausadas a favor de la gestión manual).
- **`config`**: Configuraciones de seguridad, CORS, Swagger y scheduling.
- **`utils`**: Manejo centralizado de excepciones (`RestExceptionHandler`, `NotFoundException`, etc.).

---

## 🔑 Funcionalidades Principales

### 1. Gestión de Árbitros (`/arbitros`)
- **Alta, Modificación y Estado en Sistema**:
  - Habilitación/deshabilitación en el sistema (`estadoSistema`).
  - Baja lógica / soft-delete y reactivación fluida.
- **Categorización**:
  - `AVANZADO`, `INTERMEDIO`, `PRINCIPAL_1`, `PRINCIPAL_2`, `PRINCIPAL_3`, `PRINCIPAL_4`, `ASISTENTE`, `INICIAL`.
- **Disponibilidad por Día**:
  - Disponibilidad independiente para `disponibleSabado` y `disponibleDomingo`.
  - Atributos adicionales (indumentaria, posesión de vehículo, WhatsApp de contacto).
- **Control de Suspensiones**:
  - Registro, consulta y eliminación de sanciones temporales o por fecha.

### 2. Designaciones (`/designaciones`)
- **Designación Manual**: Alta, edición y asignación directa de árbitros en canchas y partidos, con validación de categorías y disponibilidad diaria.
- **Desasignación Reactiva por Eventos**:
  - Si un árbitro cambia su estado a **No Disponible** para un sábado o domingo, el sistema (`ArbitroNoDisponibleListener`) lo remueve de forma automática y asíncrona de sus partidos futuros y emite una notificación de advertencia.
- **Designación Automática Asistida**:
  - Algoritmo para asignar árbitros disponibles optimizando categorías y evitando solapamientos en un mismo día/cancha.

### 3. Tareas Programadas y Automatizaciones (`/api/automation`)
- **Schedulers por Cron**: Las tareas automáticas periódicas (generación base y barridos por reloj) se encuentran **pausadas** para dar control 100% manual a los administradores.
- **Endpoints a Demanda**: Endpoints REST disponibles en `AutomationController` para ejecutar fases de generación base, sincronizaciones o simulaciones bajo petición manual.

### 4. Gestión Financiera (`/finanzas`)
- **Gastos**: Registro y categorización de gastos operativos por jornada.
- **Préstamos y Recuperos**:
  - Administración de préstamos otorgados a árbitros.
  - Registro de retenciones automáticas sobre las liquidaciones de partidos.
- **Reportes**: Generación de resúmenes financieros en formato PDF con JasperReports.

---

## 📖 Documentación de la API (Swagger)

Con el servidor en ejecución, podés acceder a la documentación interactiva en:

- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## ⚙️ Configuración y Despliegue

### Requisitos Previos
- **JDK 21** o superior.
- **PostgreSQL** en ejecución.
- **Maven** (o `./mvnw`).

### Variables de Entorno / application.properties
Configurar las credenciales en `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tu_base_de_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
```

### Ejecutar Localmente

1. Compilar el proyecto:
   ```bash
   ./mvnw clean install -DskipTests
   ```
2. Iniciar la aplicación:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## 🛡️ Buenas Prácticas Implementadas

- **Transaccionalidad (`@Transactional`)**: Garantiza atomicidad e integridad en modificaciones complejas de partidos, árbitros y movimientos contables.
- **Procesamiento Asíncrono Desacoplado (`@Async` + `@TransactionalEventListener`)**: Las desasignaciones por indisponibilidad se ejecutan en segundo plano post-commit para no demorar la respuesta HTTP al usuario.
- **Manejo Centralizado de Excepciones**: Uso de `@RestControllerAdvice` para estandarizar códigos de error HTTP y mensajes claros.
- **Auditoría y Logging**: Trazas detalladas con SLF4J para monitoreo de operaciones críticas y eventos de asignación.
