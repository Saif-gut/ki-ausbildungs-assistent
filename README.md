# AusbildungsKompass

Ein seriöses, deutschsprachiges MVP für einen KI-Ausbildungsassistenten. Die Expo-App ist bereits klickbar und läuft zunächst mit klar gekennzeichneten Beispieldaten. Profiländerungen und Bewerbungsstatus werden lokal gespeichert.

## Enthalten

- persönliches Profil mit optionalem Geburtsdatum
- Ausbildungsstellensuche und Detailansicht
- transparenter Abgleich `belegt / offen / fehlt`
- eigener Kontext-Chat pro Stelle im Demo-Modus
- Lebenslauf-Vorschau und mobiler PDF-Export
- individuelles Anschreiben als prüfbarer Entwurf
- Interviewtraining mit einfachem Strukturfeedback
- Bewerbungsstatus-Tracking
- Supabase-Schema mit RLS und vorbereiteter Client
- modularer AI-Orchestrator mit Ollama, Claude, Gemini und Finalizer
- automatischer AI-Router und zweistufige Datenminimierung

## Lokal starten

Voraussetzung: Node.js 22.13 oder neuer.

```powershell
npm install
npm run web
```

Für ein Mobilgerät:

```powershell
npm start
```

Dann den QR-Code mit Expo Go öffnen. PDF-Teilen ist auf Android und iOS verfügbar.

## Supabase verbinden

1. Ein Supabase-Projekt erstellen.
2. `supabase/migrations/001_initial_schema.sql` im SQL Editor ausführen.
3. `.env.example` als `.env` kopieren und URL sowie Anon-Key einsetzen.
4. App neu starten. Der Anon-Key ist für die Client-App bestimmt; RLS bleibt zwingend aktiviert. Service-Keys und KI-API-Keys gehören ausschließlich in Serverfunktionen.

Die klickbare Version nutzt absichtlich weiter den lokalen Demo-Store. Die Umstellung auf Supabase erfolgt anschließend pro Datenbereich, ohne die Screens neu aufzubauen. Weitere Entscheidungen stehen in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## AI-Orchestrator lokal testen

```powershell
Copy-Item .env.example .env
npm run ai:ollama
npm run ai:dev
```

Danach die App mit `npm run web` starten. Ohne `ANTHROPIC_API_KEY` oder `GOOGLE_GEMINI_API_KEY` werden diese Anbieter nicht aufgerufen; Ollama übernimmt die lokalen Aufgaben und Fallbacks.

Prüfungen:

```powershell
npm run ai:test
npm run ai:typecheck
npm run typecheck
npm run lint
```

Aufbau, Routingpfade, Datenschutz und Testmodus sind in [docs/AI_ORCHESTRATOR.md](docs/AI_ORCHESTRATOR.md) beschrieben.
