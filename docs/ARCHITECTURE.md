# MVP-Architektur

## Produktfluss

1. Das Profil liefert freigegebene persönliche Angaben, Schulbildung, Erfahrungen und Fähigkeiten.
2. Stellen kommen über einen austauschbaren Importdienst in die `jobs`-Tabelle. Quelle, Link und Prüfzeitpunkt bleiben erhalten.
3. Die Anforderungscheckliste gleicht belegbare Profilfelder mit expliziten Anforderungen ab. Sie zeigt `belegt`, `offen` oder `fehlt` und berechnet keine Erfolgsquote.
4. Lebenslauf und Anschreiben werden serverseitig aus Profil plus ausgewählter Stelle erzeugt. Jeder Entwurf muss vor dem Export bearbeitbar und prüfbar bleiben.
5. Stellenchat, Dokumententwürfe und Interviewtraining laufen über den modularen AI-Server. API-Schlüssel gehören nie in die App.

## Schichten

- `src/app`: Screens und Navigation mit Expo Router.
- `src/components`: wiederverwendbare UI-Bausteine.
- `src/store`: lokale Demo-Daten und späterer Synchronisationspunkt.
- `src/lib/supabase.ts`: optionaler Supabase-Client für Auth und Datenzugriff.
- `src/lib/aiClient.ts`: schlanker Client für genau einen serverseitigen AI-Endpunkt.
- `server/src/ai/providers`: austauschbare Ollama-, Anthropic- und Gemini-Provider.
- `server/src/ai/router`: regelbasierte Auswahl des günstigsten sinnvollen Pfads.
- `server/src/ai/orchestrator`: Datenschutz, Ausführung, Fallbacks und interner Trace.
- `server/src/ai/finalizer`: Ausgabe ausschließlich als eine natürliche Endantwort.
- `supabase/migrations`: Postgres-Schema und Row-Level-Security.

## Sicherheits- und Qualitätsregeln

- RLS schützt alle persönlichen Datensätze anhand von `auth.uid()`.
- Geburtsdatum und Foto sind optional. Ein Foto gehört in einen privaten Storage-Bucket mit signierten URLs.
- Chatantworten müssen Anzeigeninhalte von allgemeinem Wissen trennen und fehlende Fakten klar benennen.
- Vergütung, Fristen und Voraussetzungen erhalten Quelle und `last_verified_at`.
- Generierte Unterlagen werden als Entwurf gekennzeichnet und dürfen keine Fähigkeiten erfinden.
- Provider-Secrets werden nur vom Server aus Umgebungsvariablen gelesen. Sie haben kein `EXPO_PUBLIC_`-Präfix und werden nicht in den App-Bundle importiert.
- Details stehen in [AI_ORCHESTRATOR.md](AI_ORCHESTRATOR.md).

## Nächste Umsetzungsschritte

1. E-Mail- oder Magic-Link-Login und Profil-Synchronisierung anbinden.
2. Legale Stellenquelle auswählen und Import mit Deduplizierung bauen.
3. Den lokalen AI-Server für Produktion hinter Authentifizierung oder als geschützte Serverfunktion bereitstellen.
4. Dokumenteditor und PDF-Vorlagen erweitern.
5. Datenschutztexte, Löschfunktion, Telemetrie-Einwilligung und produktive Tests ergänzen.
