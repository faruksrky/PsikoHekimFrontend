FROM maven:3.8.5-openjdk-21-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:21-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083

# Run the application with secrets
CMD ["sh", "-c", "export GOOGLE_CLIENT_ID=$(cat /run/secrets/google_client_id) && export GOOGLE_CLIENT_SECRET=$(cat /run/secrets/google_client_secret) && export TWILIO_ACCOUNT_SID=$(cat /run/secrets/twilio_account_sid) && export TWILIO_AUTH_TOKEN=$(cat /run/secrets/twilio_auth_token) && export TWILIO_WHATSAPP_FROM=$(cat /run/secrets/twilio_whatsapp_from) && java -jar app.jar"]
