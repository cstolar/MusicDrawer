# Analyse: „Music Drawer“ (Screen-Recording vom 29.10.2026)

Quelle: iPhone-Screen-Recording (25 s, 1180×2556, HEVC 60 fps, AAC Stereo).
Aufgezeichnet wurde ein TikTok-Post (`play_music_theory`, „Good morning world ☕“),
der eine Web-App zeigt. Footer der App: **„© 2026 by tala“**.
Die TikTok-Overlays (Like/Kommentar/Share, Avatar, „Folgen“) gehören nicht zur App.

## Kernprinzip

Ein **Zeichen-Sequencer**: Man malt Linien auf ein kariertes Blatt, eine vertikale
**Abspiel-Linie (Playhead)** läuft in einer Endlosschleife von links nach rechts.
Jeder Strich, den der Playhead schneidet, erzeugt einen **gehaltenen Ton**, dessen
Tonhöhe der **y-Position** folgt (oben = hoch). Jeder Schnittpunkt wird als
**schwarzer Punkt** markiert = aktive Stimme. Mehrere Striche ⇒ Polyphonie (Akkorde).

## Gemessene Fakten

### Zeit / Loop
| Größe | Wert | Herleitung |
|---|---|---|
| Loop-Dauer | **5,33 s** | Playhead-Wraps bei 6,05 / 11,38 / 16,75 / 22,07 s |
| Tempo-Anzeige | 90 BPM | UI |
| ⇒ Loop-Länge | **8 Beats = 2 Takte 4/4** | 8 × 60/90 s = 5,33 s |
| Raster horizontal | **16 Spalten** (à ~64 px) | ⇒ 1 Spalte = 1 Achtelnote |
| Playhead-Bewegung | kontinuierlich (nicht gestuft) | ~193 px/s, linear |

### Tonhöhe
- Raster vertikal: ~21 Zeilen à ~65,5 px über das Blatt.
- **1 Rasterzeile = 1 diatonischer Skalenschritt** (≈ 3 Oktaven Umfang, ca. A2 … A5).
- Skala: **F-Dur / d-Moll** (F G A B♭ C D E) – Stimmung A4 = 440 Hz, Töne exakt auf Halbtönen (±5 Cent).
  - Belege (y in Video-Pixeln, Blatt-Unterkante ≈ 1545):
    - Becherboden y≈1446 → **B♭2** (116 Hz)
    - untere Randlinie y≈850 → **D4** (293 Hz) = 9 Schritte über B♭2 (9×66 = 594 px ✓)
    - obere Randlinie y≈715 → **F4** (350 Hz) = 2 Schritte über D4 ✓
    - Zwischenposition y≈777 → kurz E4 (~330 Hz) beim Gleiten ✓
  - Erster Strich (oben links nach unten rechts gezogen) erklingt hörbar als Glide **F4 → E4 → D4**.
- Tonhöhe ist **quantisiert**, Wechsel zwischen Stufen aber mit **Portamento** (sichtbar als
  weiche Treppenkurven im Spektrogramm, ~100–150 ms).
- Fast senkrechte Linien ⇒ schneller Glissando-Sweep über viele Stufen.

### Klang
- Ton bleibt gehalten, solange der Playhead über dem Strich liegt; langsames Abklingen
  (~-4 dB/s), danach Release-Ausklang.
- Lila Striche: nur **ungerade Obertöne** (3. ≈ -15…-19 dB, 5. ≈ -28 dB) ⇒ **Dreieckswelle**.
- Orange (Dampf) zeigt auch gerade Obertöne (4.) ⇒ vermutlich andere Wellenform
  (z. B. Sägezahn) ⇒ **Farbe = Instrument/Klangfarbe** (Hypothese, noch zu verifizieren).
- Beim Zeichnen selbst wird offenbar sofort ein Vorhörton gespielt.

## UI-Inventar (von oben nach unten)

1. `?` Hilfe-Button (oben links)
2. **Canvas**: kariertes Papier, abgerundete Karte, 16 × ~21 Raster, Striche mit runden
   Enden, Stützpunkte als kleine Punkte entlang des Strichs sichtbar.
3. Toolbar-Zeile 1: ⏸ Play/Pause · ✏️ Stift (aktiv, gefüllt schwarz) · Radierer ·
   ↺ Rückgängig · ⤮ Zufall/Shuffle · ⏺ Aufnahme · `− 90 +` Tempo (BPM)
4. Farbpalette (9): grün, rot, lila, orange, dunkelblau, pink, hellblau, schwarz,
   pfirsich (Auswahl = Ring um Kreis)
5. Zeile 3: Mini-Klaviatur (Tonart-/Skalenwahl?) · ▲ ▼ (Oktave? ▼ aktiv) ·
   ∿ (Glide/Wellenform?) · Klaviatur-Icon (Instrument?) · `|·|` (Raster/Takt?)
6. Zeile 4: (verdeckt) `1?` · `2` · `3` (Loop-Länge in Takten oder Pinselgröße?) ·
   `•` `••` `•••` (Notendichte/Strichstärke?) · ☁ (Reverb? / Speichern?)
7. Footer „© 2026 by tala“ (Link)

Viele Buttons der unteren Reihen sind von TikTok-Overlays verdeckt; Funktion nur vermutet.

## Ablauf im Video
- 0,0–0,9 s: Ende des vorherigen TikTok-Loops (fertige Zeichnung)
- 0,9 s: TikTok-Video beginnt von vorne, Canvas leer
- 1–11 s: Becher in Lila (Rand, Wände, Boden), dann Henkel
- ~12–15 s: Farbwechsel Hellblau → Kaffee-Kringel im Rand
- ~15–22 s: Farbwechsel Orange → drei Dampf-Schwaden
- ~22 s: Farbwechsel Rot ausgewählt (noch nichts gezeichnet)

## Offene Fragen fürs Reverse Engineering
- Werden Noten-Onsets zeitlich auf das Achtel-Raster quantisiert oder frei?
- Grundton / Skala umschaltbar (Mini-Klaviatur)? Andere Skalen (Pentatonik, Moll)?
- Welche Klangfarbe pro Farbe? (eigene Aufnahme mit je einem horizontalen Strich pro Farbe)
- Bedeutung von ▲▼, ∿, `|·|`, `1/2/3`, `•/••/•••`, ☁, ⤮, ⏺
- Gibt es die App öffentlich (Suche nach „tala“ / play_music_theory)?

## Vorschlag Tech-Stack für Nachbau
Web-App: Canvas 2D (oder SVG) + Web Audio API (`OscillatorNode` pro Schnittpunkt,
`frequency.setTargetAtTime` für Portamento, `GainNode` für Hüllkurve, ggf. `ConvolverNode`
für Reverb). Strich = Polyline; pro Frame Schnittpunkte mit x = Playhead berechnen,
y → Skalenstufe → Frequenz; Stimmen anhand Strich-ID halten/beenden.
