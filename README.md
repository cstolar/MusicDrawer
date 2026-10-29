# Music Drawer

Zeichen-Sequencer im Browser: Linien malen, eine Abspiel-Linie läuft im Loop darüber,
jeder geschnittene Strich klingt als Ton (Höhe = Tonhöhe, Farbe = Instrument).

**Live:** https://cstolar.github.io/MusicDrawer/

Reines HTML/CSS/JS mit Web Audio API, kein Build-Schritt. Lokal starten:
`python3 -m http.server` und http://localhost:8000 öffnen.

## Instrumente (v0.1)
| Farbe | Instrument | Klang & Effekte |
|---|---|---|
| Grün | Marimba | Sinus + 4. Partialton, kurzes Abklingen · Lowpass · Ping-Delay · kleiner Raum |
| Rot | Acid Lead | Sägezahn · Auto-Wah (Resonanzfilter + LFO) · Verzerrung · Delay |
| Lila | Soft Pad | Dreieck (wie im Original) · Lowpass · Chorus · großer Hall |
| Orange | Brass | 2 verstimmte Sägezähne · Lowpass · Sättigung · Hall |
| Dunkelblau | Bass | Dreieck + Sub-Sinus, Oktave tiefer · Lowpass · Sättigung |
| Pink | Glocke | FM-Synthese, Oktave höher · Delay · großer Hall |
| Hellblau | Glasflöte | Sinus + Vibrato, Oktave höher · Highpass · langes Delay · Hall |
| Schwarz | 8-Bit | Rechteck ohne Glide · Bitcrusher · Highpass · Slap-Delay |
| Pfirsich | Orgel | Zugriegel 8′ 4′ 2⅔′ · Röhren-Sättigung · Rotary-Tremolo · Hall |

Analyse des Vorbilds: [docs/ANALYSE.md](docs/ANALYSE.md) (im Analyse-PR).
