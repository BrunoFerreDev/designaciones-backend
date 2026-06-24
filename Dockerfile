# 1. Usamos una imagen base oficial y ligera de Java 21
FROM eclipse-temurin:21-jre-alpine

# 2. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos el archivo JAR de tu proyecto al contenedor
# (Asegúrate de haber compilado tu proyecto antes con Maven o Gradle)
COPY target/*.jar app.jar

# 4. Exponemos el puerto en el que corre Spring Boot por defecto (usualmente 8080)
EXPOSE 8080

# 5. Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]