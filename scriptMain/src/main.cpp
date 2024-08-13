#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Preferences.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define LED_SUCESSO 2
#define LED_ERRO 15

DHT dht(DHTPIN, DHTTYPE);
Preferences preferences;
WebServer server(80);

const char* ap_ssid = "ESP32_Config";
const char* ap_password = "123456789";

unsigned long previousMillis = 0;
const long interval = 60000;  // Intervalo de 1 minuto

// Função para enviar dados para a rota HTTP
void sendData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    digitalWrite(LED_ERRO, HIGH);  // Liga o LED de erro
    return;
  }

  Serial.print("Umidade: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://192.168.1.7:3000/infoEsp");
    http.addHeader("Content-Type", "application/json");

    String postData = "{\"temperatura\":\"" + String(temperature) + "\",\"umidade\":\"" + String(humidity) + "\"}";

    Serial.println(postData);

    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
      if (httpResponseCode == 200) {
        Serial.println("Data sent successfully!");
        digitalWrite(LED_SUCESSO, HIGH);
        digitalWrite(LED_ERRO, LOW);  // Desliga o LED de erro
      } else {
        digitalWrite(LED_ERRO, HIGH);  // Liga o LED de erro se a resposta não for 200
        digitalWrite(LED_SUCESSO, LOW);
      }
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      digitalWrite(LED_ERRO, HIGH);  // Liga o LED de erro se falhar ao enviar
      digitalWrite(LED_SUCESSO, LOW);
    }

    http.end();
  } else {
    Serial.println("WiFi not connected!");
    digitalWrite(LED_ERRO, HIGH);  // Liga o LED de erro se não estiver conectado ao Wi-Fi
    digitalWrite(LED_SUCESSO, LOW);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(LED_SUCESSO, OUTPUT);
  pinMode(LED_ERRO, OUTPUT);
  digitalWrite(LED_SUCESSO, LOW);
  digitalWrite(LED_ERRO, LOW);

  dht.begin();

  WiFi.softAP(ap_ssid, ap_password);

  server.on("/", HTTP_GET, []() {
    server.send(200, "text/html", "<form action=\"/save\" method=\"POST\">"
                                  "<label for=\"ssid\">SSID:</label><br>"
                                  "<input type=\"text\" id=\"ssid\" name=\"ssid\"><br>"
                                  "<label for=\"password\">Password:</label><br>"
                                  "<input type=\"password\" id=\"password\" name=\"password\"><br><br>"
                                  "<input type=\"submit\" value=\"Submit\">"
                                  "</form>");
  });

  server.on("/save", HTTP_POST, []() {
    String ssid = server.arg("ssid");
    String password = server.arg("password");

    preferences.begin("wifi-config", false);
    preferences.putString("ssid", ssid);
    preferences.putString("password", password);
    preferences.end();

    server.send(200, "text/html", "Credentials saved. Rebooting...");
    delay(2000);
    ESP.restart();
  });

  server.begin();
  Serial.println("Access Point started.");

  preferences.begin("wifi-config", true);
  String savedSSID = preferences.getString("ssid", "");
  String savedPassword = preferences.getString("password", "");
  preferences.end();

  if (savedSSID.length() > 0 && savedPassword.length() > 0) {
    WiFi.begin(savedSSID.c_str(), savedPassword.c_str());
    Serial.print("Connecting to ");
    Serial.print(savedSSID);
    Serial.print("...");

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Connected!");
      digitalWrite(LED_SUCESSO, HIGH);  // Liga o LED de sucesso
    } else {
      Serial.println("Failed to connect.");
      digitalWrite(LED_ERRO, HIGH);     // Liga o LED de erro
    }
  }
}

void loop() {
  server.handleClient();

  unsigned long currentMillis = millis();
  if (WiFi.status() == WL_CONNECTED && currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    sendData();
  }
}
