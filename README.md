# Sistema de Designaciones Arbitrales - Backend

API REST desarrollada en **Spring Boot** para la gestión integral de un sistema de designaciones arbitrales, que incluye la administración de árbitros, canchas, designaciones (automáticas y manuales), gestión financiera (gastos, préstamos, recuperos) y control de suspensiones.

## 🚀 Tecnologías Utilizadas

- **Java 21/25**
- **Spring Boot 3.x / 4.x**
  - Spring Web MVC (API REST)
  - Spring Data JPA (Persistencia de datos)
  - Spring Boot Actuator (Monitoreo)
  - Spring HATEOAS
- **PostgreSQL** (Base de datos principal)
- **Lombok** (Reducción de código repetitivo)
- **Springdoc OpenAPI / Swagger UI** (Documentación de la API)
- **JasperReports** (Generación de PDFs para reportes financieros)
- **Maven** (Gestión de dependencias y construcción)

---

## 🛠️ Arquitectura y Estructura del Proyecto

El proyecto sigue una arquitectura tradicional en capas:
- **`controller`**: Controladores REST que exponen los endpoints (`ArbitroController`, `DesignacionController`, `GastosController`, etc.). Las URLs siguen estándares RESTful.
- **`service`**: Lógica de negocio transaccional. Implementa interfaces (ej: `DesignacionService`) y su respectiva implementación (`DesignacionServiceImpl`).
- **`repository`**: Interfaces de Spring Data JPA con consultas derivadas y JPQL optimizadas.
- **`model`**: Entidades mapeadas a la base de datos (PostgreSQL).
- **`dto`**: Objetos de Transferencia de Datos separados para lectura (`get`) y escritura (`post`).
- **`config`**: Configuraciones globales como CORS y Swagger/OpenAPI.
- **`utils`**: Manejo global de excepciones (`RestExceptionHandler`, `NotFoundException`, etc.).

---

## 🔑 Funcionalidades Principales

### 1. Gestión de Árbitros (`/arbitros`)
- Alta, baja y modificación de árbitros.
- Gestión de **Disponibilidad Inteligente**:
  - Un interruptor general para cualquier día.
  - Interruptores específicos para fines de semana (`disponibleSabado` y `disponibleDomingo`).
- Registro y consulta de **Suspensiones**.

### 2. Designaciones (`/designaciones`)
- **Designación Manual**: Permite añadir, eliminar y configurar los árbitros de un partido manualmente, validando que el árbitro cumpla con la categoría necesaria y esté disponible ese día.
- **Designación Automática**: Un motor que, dado un ID de designación, identifica la fecha (día de la semana) y asigna automáticamente la cantidad necesaria de árbitros evaluando su categoría, evitando repeticiones en la misma cancha y respetando su disponibilidad para ese día específico.

### 3. Gestión Financiera (`/finanzas`)
- **Gastos**: Registro de gastos fijos y variables asociados a las jornadas.
- **Préstamos y Recuperos**: 
  - Gestión de préstamos a árbitros.
  - Registro de cobros y retenciones aplicadas sobre lo producido por el árbitro en las designaciones.
- Generación de reportes en PDF usando JasperReports.

---

## 📖 Documentación de la API (Swagger)

La API cuenta con documentación interactiva generada automáticamente. Una vez que el servidor esté corriendo, puedes acceder a:

- **Swagger UI** (Interfaz Gráfica): `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## ⚙️ Configuración y Despliegue

### Requisitos Previos
- **JDK 21** o superior instalado y configurado en el `PATH` (`javac`).
- **PostgreSQL** corriendo localmente o remotamente.
- **Maven** (o usar el wrapper incluido `./mvnw`).

### Variables de Entorno / application.properties
Asegúrate de configurar correctamente los parámetros de conexión a la base de datos en `src/main/resources/application.properties` (o `application.yml`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tu_base_de_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
```

### Ejecutar Localmente

1. Clona el repositorio y navega a la carpeta del proyecto.
2. Compila el proyecto y salta los tests si lo deseas:
   ```bash
   ./mvnw clean install -DskipTests
   ```
3. Inicia la aplicación:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## 🛡️ Buenas Prácticas Implementadas

- **Transaccionalidad (`@Transactional`)**: Todas las operaciones de escritura que involucran múltiples tablas (como designaciones automáticas o finanzas) aseguran atomicidad, previniendo estados corruptos en la base de datos ante errores.
- **Batch Loading (Solución N+1)**: Optimización extrema al momento de recuperar datos complejos. Evita la sobrecarga de consultas SQL agilizando los tiempos de respuesta.
- **Manejo Centralizado de Excepciones**: Uso de `@RestControllerAdvice` para estandarizar las respuestas de error (como HTTP 400 Bad Request, HTTP 404 Not Found), ocultando trazas del sistema (stack traces) en producción.
- **Logging Transparente**: Integración con SLF4J (`@Slf4j`) para el trazado de logs con distintos niveles (`INFO`, `WARN`, `ERROR`, `DEBUG`).
