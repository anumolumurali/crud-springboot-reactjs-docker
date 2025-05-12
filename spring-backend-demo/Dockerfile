# Build the application using the OpenJDK development image
FROM registry.suse.com/bci/openjdk-devel:21 AS build
WORKDIR /app
COPY . ./
RUN mvn clean install -DskipTests

# Bundle the application into OpenJDK runtime image
FROM registry.suse.com/bci/openjdk:21
WORKDIR /app
COPY --from=build /app/target/*.jar application.jar
ENTRYPOINT ["java", "-Xmx2048M", "-jar", "application.jar"]

