# ==========================================
# 1. ETAPA DE COMPILACIÓN (Railway Build)
# ==========================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copiar archivos del proyecto
COPY pom.xml .
COPY src ./src

# Compilar proyecto en Railway
RUN mvn clean package -DskipTests

# ==========================================
# 2. ETAPA DE EJECUCIÓN (Railway Runtime)
# ==========================================
FROM eclipse-temurin:21-jre-alpine

# Configurar zona horaria de Argentina
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime && \
    echo "America/Argentina/Buenos_Aires" > /etc/timezone

WORKDIR /app

# Copiar el JAR compilado desde la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-Duser.timezone=America/Argentina/Buenos_Aires", "-jar", "app.jar"]