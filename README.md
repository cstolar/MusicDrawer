# Music Drawer

Zeichen-Sequencer im Browser: Linien malen, eine Abspiel-Linie läuft im Loop darüber,
jeder geschnittene Strich klingt als Ton (Höhe = Tonhöhe, Farbe = Instrument).

**Live:** https://cstolar.github.io/MusicDrawer/

Reines HTML/CSS/JS mit Web Audio API, kein Build-Schritt. Lokal starten:
`python3 -m http.server` und http://localhost:8000 öffnen.

## Neon-Modus
Beim Abspielen färbt sich die App dunkel und die Striche leuchten als Neonröhren
(farbiger Schein + heller Kern); die Schnittpunkte blitzen in der Instrumentfarbe auf.
Der Glow wird je Zeichnung einmal in eine Ebene gerendert, nicht in jedem Frame.

## Teilen
Die Zeichnung steckt komplett im Link (`#d=<bpm>-<daten>`): Striche werden vereinfacht,
auf 4096 Stufen je Achse gerundet und binär als Base64 in den URL-Hash geschrieben.
Kein Server, keine Datenbank. Die Adresszeile ist immer aktuell; der Teilen-Button
öffnet das Teilen-Menü des Handys (sonst wird der Link kopiert).

## Instrumente (v0.2)
| Farbe | Instrument | Klang & Effekte |
|---|---|---|
| Grün | Marimba | Sinus + 4. Partialton, kurzes Abklingen · Lowpass · Ping-Delay · kleiner Raum |
| Rot | Acid Lead | Sägezahn · Auto-Wah (Resonanzfilter + LFO) · Verzerrung · Delay |
| Lila | Soft Pad | Dreieck (wie im Original) · Lowpass · Chorus · großer Hall |
| Orange | Brass | 2 verstimmte Sägezähne · Lowpass · Sättigung · Hall |
| Dunkelblau | Bass | Sinus + Dreieck, zwei Oktaven tiefer · Röhren-Sättigung · dunkler Lowpass |
| Pink | Glocke | FM-Synthese, Oktave höher · Delay · großer Hall |
| Hellblau | Glasflöte | Sinus + Vibrato, Oktave höher · Highpass · langes Delay · Hall |
| Schwarz | 8-Bit | Rechteck ohne Glide · Bitcrusher · Highpass · Slap-Delay |
| Pfirsich | Orgel | Zugriegel 8′ 4′ 2⅔′ · Röhren-Sättigung · Rotary-Tremolo · Hall |

Analyse des Vorbilds: [docs/ANALYSE.md](docs/ANALYSE.md) (im Analyse-PR).
