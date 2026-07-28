FROM eclipse-temurin:21-jre-alpine

# Configurar zona horaria de Argentina
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime && \
    echo "America/Argentina/Buenos_Aires" > /etc/timezone

WORKDIR /app

# Copiar el JAR generado
COPY target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-Duser.timezone=America/Argentina/Buenos_Aires", "-jar", "app.jar"]