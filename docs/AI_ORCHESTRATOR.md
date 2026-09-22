# Modularer AI-Orchestrator

## Datenfluss

```text
Expo-App
   │  nur minimiertes Profil, keine Provider-Schlüssel
   ▼
lokaler AI-Server :8787
   │
   ├─ Router: Aufgabe, Komplexität, Sensibilität
   ├─ Privacy Guard: Whitelist + Entfernung direkter Identifikatoren
   ├─ Ollama: lokale Analyse / einfacher lokaler Fallback
   ├─ Claude: hochwertiger Entwurf, wenn konfiguriert
   ├─ Gemini: Fakten- und Qualitätsprüfung, wenn konfiguriert
   └─ Finalizer: eine natürliche Endfassung
          │
          ▼
       eine Antwort an die App
```

Provider implementieren denselben `AIProvider`-Vertrag. Modellwechsel benötigen nur eine Umgebungsvariable oder eine neue Providerimplementierung; Router, Orchestrator und App bleiben unverändert.

## Routing

| Anfrage | Vorgesehener Pfad |
| --- | --- |
| Begrüßung / sehr einfach | `ollama` |
| Allgemeine Berufsfrage | `anthropic` |
| Stellenfrage mit Kontext | `ollama -> anthropic` |
| Profilabgleich | `ollama -> anthropic -> gemini -> finalizer` |
| Bewerbung / Lebenslauf | `ollama -> anthropic -> gemini -> finalizer` |
| Interviewtraining | `ollama -> anthropic -> gemini -> finalizer` |

Fehlt ein externer Schlüssel, wird der betreffende Provider nicht aufgerufen. Ollama übernimmt den lokalen Entwurf, soweit es verfügbar ist. Eine Providerstörung darf keine interne Kritik oder Zwischenantwort an den Client durchreichen.

## Datenschutz

- Der Client überträgt nur Schule, Abschluss, Erfahrung, Fähigkeiten, Sprachen und Interessen.
- Der Server verwendet zusätzlich eine aufgabenspezifische Feld-Whitelist.
- Name, E-Mail, Telefon, Adresse, Geburtsdatum und Foto werden vor Provideraufrufen entfernt.
- Bekannte direkte Identifikatoren werden auch im Fragetext ersetzt.
- Serverlogs enthalten Ereignis, Dauer und optionale Routing-Metadaten, aber keine Prompts, Profile oder Providerantworten.
- Die vorhandenen Supabase-RLS-Regeln bleiben unverändert. Migration `002_encryption_ready.sql` ergänzt ein RLS-geschütztes Envelope-Feld für spätere clientseitige Verschlüsselung.

Die Regeln minimieren Daten, können aber freie Texte nicht perfekt klassifizieren. Vor einem Produktivbetrieb sollte zusätzlich eine DLP-Prüfung, Authentifizierung des Serverendpunkts und eine Lösch-/Aufbewahrungsrichtlinie ergänzt werden.

## Interner Testmodus

Der normale API-Response enthält ausschließlich `answer`. Für lokale Tests:

```env
AI_INTERNAL_TEST_MODE=true
```

Nur wenn zusätzlich der Request-Header `x-ai-debug: 1` gesetzt ist, enthält die Antwort `trace` mit Aufgabe, Sensibilität, vorgesehenem und ausgeführtem Pfad sowie Namen entfernter Felder. Inhalte oder Zwischenantworten stehen nie im Trace.

## Lokaler Start

```powershell
Copy-Item .env.example .env
npm run ai:ollama
npm run ai:dev
```

In einem zweiten Terminal:

```powershell
$body = @{ message = 'Hallo' } | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/v1/ai/respond -Method Post -ContentType application/json -Body $body
```

Die App spricht nur mit `EXPO_PUBLIC_AI_SERVER_URL`. Für Tests auf einem echten Smartphone muss diese URL auf die erreichbare LAN-Adresse des Entwicklungsrechners zeigen; der Server sollte dann nur im vertrauenswürdigen Entwicklungsnetz gebunden werden.

