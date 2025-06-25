FROM openjdk:21

WORKDIR /app

# Copy Maven wrapper và pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cache layer)
RUN chmod +x ./mvnw
RUN ./mvnw dependency:resolve

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Run the jar file
EXPOSE 8080
CMD ["java", "-jar", "target/orion-0.0.1-SNAPSHOT.jar"]