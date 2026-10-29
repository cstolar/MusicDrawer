'use strict';

const APP_VERSION = 'v0.2.1';

// ---------------------------------------------------------------------------
// Musik-Konstanten (aus der Videoanalyse, siehe docs/ANALYSE.md)
// ---------------------------------------------------------------------------
const COLS = 16;              // 16 Spalten = 2 Takte in Achteln
const ROWS = 21;              // 1 Zeile = 1 Skalenschritt (~3 Oktaven)
const BEATS_PER_LOOP = 8;
const BASE_MIDI = 45;         // unterste Zeile = A2
const SCALE = [0, 1, 3, 5, 7, 8, 10]; // ab A: A B♭ C D E F G  (F-Dur / d-Moll)

function degreeToMidi(degree) {
  const oct = Math.floor(degree / SCALE.length);
  const step = ((degree % SCALE.length) + SCALE.length) % SCALE.length;
  return BASE_MIDI + 12 * oct + SCALE[step];
}
const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
const yToDegree = (y) => Math.min(ROWS - 1, Math.max(0, Math.floor((1 - y) * ROWS)));

// ---------------------------------------------------------------------------
// Instrumente: eine Farbe = ein Instrument mit eigener Effektkette
//   oscs:    Oszillatoren (type, Frequenz-Ratio, Pegel, Detune in Cent)
//   env:     Attack / Decay / Sustain-Level / Release (Sekunden)
//   inserts: Effekte in Reihe (filter, drive, crush, chorus, tremolo, wah)
//   delay / reverb: Send-Effekte
// ---------------------------------------------------------------------------
const INSTRUMENTS = [
  {
    name: 'Marimba', color: '#2e9e5b', fx: 'Lowpass · Ping-Delay · kleiner Raum',
    oscs: [{ type: 'sine', ratio: 1, gain: 1 }, { type: 'sine', ratio: 4, gain: 0.25 }],
    env: { a: 0.004, d: 0.35, s: 0.12, r: 0.25 }, glide: 0.03, octave: 0, gain: 0.9,
    inserts: [{ fx: 'filter', type: 'lowpass', freq: 3200, q: 0.7 }],
    delay: { time: 0.333, feedback: 0.35, mix: 0.28 }, reverb: 0.18,
  },
  {
    name: 'Acid Lead', color: '#d23a2f', fx: 'Auto-Wah (Resonanzfilter + LFO) · Verzerrung · Delay',
    oscs: [{ type: 'sawtooth', ratio: 1, gain: 1 }],
    env: { a: 0.01, d: 0.2, s: 0.7, r: 0.15 }, glide: 0.06, octave: 0, gain: 0.25,
    inserts: [
      { fx: 'wah', freq: 900, depth: 700, rate: 2.2, q: 11 },
      { fx: 'drive', amount: 3 },
    ],
    delay: { time: 0.25, feedback: 0.3, mix: 0.2 }, reverb: 0.12,
  },
  {
    name: 'Soft Pad', color: '#6c56d6', fx: 'Dreieckswelle (wie im Video) · Chorus · großer Hall',
    oscs: [{ type: 'triangle', ratio: 1, gain: 1 }],
    env: { a: 0.06, d: 0.6, s: 0.75, r: 0.6 }, glide: 0.08, octave: 0, gain: 1.3,
    inserts: [
      { fx: 'filter', type: 'lowpass', freq: 2600, q: 0.5 },
      { fx: 'chorus', rate: 0.7, depth: 0.004, mix: 0.5 },
    ],
    reverb: 0.4,
  },
  {
    name: 'Brass', color: '#e8892b', fx: 'Zwei verstimmte Sägezähne · Lowpass · leichte Sättigung',
    oscs: [{ type: 'sawtooth', ratio: 1, gain: 0.6, detune: -7 }, { type: 'sawtooth', ratio: 1, gain: 0.6, detune: 7 }],
    env: { a: 0.05, d: 0.3, s: 0.65, r: 0.2 }, glide: 0.05, octave: 0, gain: 0.6,
    inserts: [
      { fx: 'filter', type: 'lowpass', freq: 1700, q: 2 },
      { fx: 'drive', amount: 1.5 },
    ],
    reverb: 0.2,
  },
  {
    name: 'Bass', color: '#2f45c4', fx: 'Zwei Oktaven tiefer · Sinus + Dreieck · Röhren-Sättigung · dunkler Lowpass',
    // Grundton 2 Oktaven tiefer; die Sättigung erzeugt Obertöne, damit der
    // Bass auch auf Handy-Lautsprechern als Tonhöhe hörbar bleibt.
    oscs: [{ type: 'sine', ratio: 1, gain: 1 }, { type: 'triangle', ratio: 1, gain: 0.45 }],
    env: { a: 0.008, d: 0.3, s: 0.85, r: 0.15 }, glide: 0.05, octave: -24, gain: 0.35,
    inserts: [
      { fx: 'drive', amount: 3 },
      { fx: 'filter', type: 'lowpass', freq: 420, q: 4 },
    ],
    reverb: 0.04,
  },
  {
    name: 'Glocke', color: '#d1509f', fx: 'FM-Synthese · Oktave höher · Delay · großer Hall',
    oscs: [{ type: 'sine', ratio: 1, gain: 1 }],
    fm: { ratio: 3.5, index: 2.5, decay: 0.8 },
    env: { a: 0.002, d: 1.2, s: 0.18, r: 0.8 }, glide: 0.02, octave: 12, gain: 0.55,
    inserts: [],
    delay: { time: 0.375, feedback: 0.4, mix: 0.25 }, reverb: 0.45,
  },
  {
    name: 'Glasflöte', color: '#6fb1e3', fx: 'Sinus mit Vibrato · Highpass · langes Delay · Hall',
    oscs: [{ type: 'sine', ratio: 1, gain: 1 }, { type: 'sine', ratio: 2, gain: 0.12 }],
    vibrato: { rate: 5.2, cents: 18 },
    env: { a: 0.09, d: 0.4, s: 0.85, r: 0.4 }, glide: 0.1, octave: 12, gain: 0.55,
    inserts: [{ fx: 'filter', type: 'highpass', freq: 280, q: 0.7 }],
    delay: { time: 0.5, feedback: 0.3, mix: 0.25 }, reverb: 0.5,
  },
  {
    name: '8-Bit', color: '#222222', fx: 'Rechteck · Bitcrusher · keine Glides · Slap-Delay',
    oscs: [{ type: 'square', ratio: 1, gain: 1 }],
    env: { a: 0.002, d: 0.1, s: 0.6, r: 0.05 }, glide: 0, octave: 0, gain: 0.45,
    inserts: [
      { fx: 'crush', bits: 4 },
      { fx: 'filter', type: 'highpass', freq: 180, q: 0.7 },
    ],
    delay: { time: 0.166, feedback: 0.25, mix: 0.2 }, reverb: 0.05,
  },
  {
    name: 'Orgel', color: '#f0a56b', fx: 'Zugriegel 8′ 4′ 2⅔′ · Rotary-Tremolo · Röhren-Sättigung',
    oscs: [
      { type: 'sine', ratio: 1, gain: 0.8 },
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 3, gain: 0.35 },
    ],
    env: { a: 0.015, d: 0.1, s: 0.9, r: 0.08 }, glide: 0.03, octave: 0, gain: 0.45,
    inserts: [
      { fx: 'drive', amount: 1.3 },
      { fx: 'tremolo', rate: 6, depth: 0.35 },
    ],
    reverb: 0.3,
  },
];

// ---------------------------------------------------------------------------
// Audio-Engine
// ---------------------------------------------------------------------------
let ctx = null;
let master = null;
let reverbBus = null;
const buses = []; // pro Instrument: { input }

function initAudio() {
  if (ctx) return;
  // iOS: Wiedergabe auch bei Stummschalter (Safari 16.4+)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master = ctx.createGain();
  master.gain.value = 0.7;
  master.connect(comp).connect(ctx.destination);

  const conv = ctx.createConvolver();
  conv.buffer = makeImpulse(2.6, 2.5);
  reverbBus = ctx.createGain();
  reverbBus.connect(conv).connect(master);

  INSTRUMENTS.forEach((inst) => buses.push(buildBus(inst)));
}

function makeImpulse(seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function makeLfo(rate, depth, target) {
  const lfo = ctx.createOscillator();
  const amt = ctx.createGain();
  lfo.frequency.value = rate;
  amt.gain.value = depth;
  lfo.connect(amt).connect(target);
  lfo.start();
}

function shaper(curveFn) {
  const ws = ctx.createWaveShaper();
  const n = 2048;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) curve[i] = curveFn((i / (n - 1)) * 2 - 1);
  ws.curve = curve;
  return ws;
}

// Jeder Insert-Effekt liefert { input, output }
function buildInsert(spec) {
  switch (spec.fx) {
    case 'filter': {
      const f = ctx.createBiquadFilter();
      f.type = spec.type;
      f.frequency.value = spec.freq;
      f.Q.value = spec.q;
      return { input: f, output: f };
    }
    case 'wah': {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = spec.freq;
      f.Q.value = spec.q;
      makeLfo(spec.rate, spec.depth, f.frequency);
      return { input: f, output: f };
    }
    case 'drive': {
      const k = spec.amount;
      const ws = shaper((x) => Math.tanh(k * x) / Math.tanh(k));
      ws.oversample = '4x';
      return { input: ws, output: ws };
    }
    case 'crush': {
      const steps = Math.pow(2, spec.bits - 1);
      const ws = shaper((x) => Math.round(x * steps) / steps);
      return { input: ws, output: ws };
    }
    case 'chorus': {
      const input = ctx.createGain();
      const output = ctx.createGain();
      const wet = ctx.createGain();
      const d = ctx.createDelay(0.05);
      d.delayTime.value = 0.015;
      wet.gain.value = spec.mix;
      makeLfo(spec.rate, spec.depth, d.delayTime);
      input.connect(output);
      input.connect(d).connect(wet).connect(output);
      return { input, output };
    }
    case 'tremolo': {
      const g = ctx.createGain();
      g.gain.value = 1 - spec.depth;
      makeLfo(spec.rate, spec.depth, g.gain);
      return { input: g, output: g };
    }
  }
  throw new Error('Unbekannter Effekt: ' + spec.fx);
}

function buildBus(inst) {
  const input = ctx.createGain();
  let node = input;
  for (const spec of inst.inserts) {
    const fx = buildInsert(spec);
    node.connect(fx.input);
    node = fx.output;
  }
  const out = ctx.createGain();
  out.gain.value = inst.gain;
  node.connect(out);
  out.connect(master);

  if (inst.reverb) {
    const send = ctx.createGain();
    send.gain.value = inst.reverb;
    out.connect(send).connect(reverbBus);
  }
  if (inst.delay) {
    const d = ctx.createDelay(2);
    const fb = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    const wet = ctx.createGain();
    d.delayTime.value = inst.delay.time;
    fb.gain.value = inst.delay.feedback;
    tone.type = 'lowpass';
    tone.frequency.value = 3000;
    wet.gain.value = inst.delay.mix;
    out.connect(d);
    d.connect(tone).connect(fb).connect(d);
    tone.connect(wet).connect(master);
  }
  return { input };
}

// Eine Stimme = ein Schnittpunkt Playhead × Strich
class Voice {
  constructor(instIndex, midi) {
    const inst = INSTRUMENTS[instIndex];
    this.inst = inst;
    const t = ctx.currentTime;
    const freq = midiToFreq(midi + inst.octave);
    this.midi = midi;

    this.env = ctx.createGain();
    this.env.gain.setValueAtTime(0, t);
    this.env.gain.linearRampToValueAtTime(0.3, t + inst.env.a);
    this.env.gain.setTargetAtTime(0.3 * inst.env.s, t + inst.env.a, inst.env.d / 3);
    this.env.connect(buses[instIndex].input);

    this.oscs = inst.oscs.map((o) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = o.type;
      osc.frequency.value = freq * o.ratio;
      if (o.detune) osc.detune.value = o.detune;
      g.gain.value = o.gain;
      osc.connect(g).connect(this.env);
      osc.start(t);
      return { osc, ratio: o.ratio };
    });

    if (inst.fm) {
      const mod = ctx.createOscillator();
      const idx = ctx.createGain();
      mod.frequency.value = freq * inst.fm.ratio;
      idx.gain.setValueAtTime(freq * inst.fm.index, t);
      idx.gain.setTargetAtTime(freq * inst.fm.index * 0.15, t, inst.fm.decay / 3);
      mod.connect(idx);
      this.oscs.forEach(({ osc }) => idx.connect(osc.frequency));
      mod.start(t);
      this.oscs.push({ osc: mod, ratio: inst.fm.ratio });
    }

    if (inst.vibrato) {
      const lfo = ctx.createOscillator();
      const amt = ctx.createGain();
      lfo.frequency.value = inst.vibrato.rate;
      amt.gain.value = inst.vibrato.cents;
      lfo.connect(amt);
      this.oscs.forEach(({ osc }) => amt.connect(osc.detune));
      lfo.start(t);
      this.oscs.push({ osc: lfo, ratio: 0 });
    }
  }

  setMidi(midi) {
    if (midi === this.midi) return;
    this.midi = midi;
    const t = ctx.currentTime;
    const freq = midiToFreq(midi + this.inst.octave);
    for (const { osc, ratio } of this.oscs) {
      if (!ratio) continue;
      const current = osc.frequency.value;
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setValueAtTime(current, t);
      if (this.inst.glide > 0) osc.frequency.setTargetAtTime(freq * ratio, t, this.inst.glide / 3);
      else osc.frequency.setValueAtTime(freq * ratio, t);
    }
  }

  stop() {
    const t = ctx.currentTime;
    const r = this.inst.env.r;
    const g = this.env.gain;
    const current = g.value;
    g.cancelScheduledValues(t);
    g.setValueAtTime(current, t);
    g.setTargetAtTime(0, t, r / 4);
    for (const { osc } of this.oscs) osc.stop(t + r + 0.2);
  }
}

// Kurzes Arpeggio zum Vorhören beim Farbwechsel
function audition(instIndex) {
  if (!ctx) return;
  [7, 9, 11, 14].forEach((deg, i) => {
    setTimeout(() => {
      const v = new Voice(instIndex, degreeToMidi(deg));
      setTimeout(() => v.stop(), 170);
    }, i * 140);
  });
}

// ---------------------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------------------
const state = {
  strokes: [],          // { id, inst, pts: [{x,y}] } in normierten Koordinaten 0..1
  current: null,
  inst: 2,              // Start mit Lila (wie im Video)
  bpm: 90,
  playing: false,
  loopStart: 0,         // ctx.currentTime, an dem pos = 0 war
  pausedPos: 0,
};
let nextId = 1;
const voices = new Map(); // key -> Voice
let previewVoice = null;

const loopDuration = () => (BEATS_PER_LOOP * 60) / state.bpm;

function playheadPos() {
  if (!ctx || !state.playing) return state.pausedPos;
  const p = (ctx.currentTime - state.loopStart) / loopDuration();
  return p - Math.floor(p);
}

function setPlaying(on) {
  initAudio();
  if (ctx.state !== 'running') ctx.resume();
  if (on === state.playing) return;
  if (on) {
    state.loopStart = ctx.currentTime - state.pausedPos * loopDuration();
  } else {
    state.pausedPos = playheadPos();
    stopAllVoices();
  }
  state.playing = on;
  if (on) ui.hint.classList.add('hidden');
  ui.play.textContent = on ? '❚❚' : '▶';
  ui.play.classList.toggle('active', on);
}

function setBpm(bpm) {
  const pos = playheadPos();
  state.bpm = Math.min(180, Math.max(50, bpm));
  if (ctx) state.loopStart = ctx.currentTime - pos * loopDuration();
  ui.bpm.textContent = state.bpm;
}

function stopAllVoices() {
  voices.forEach((v) => v.stop());
  voices.clear();
}

// Alle Schnittpunkte der Strich-Polylinien mit der Senkrechten x
function intersections(x) {
  const hits = [];
  for (const s of state.strokes) {
    let k = 0;
    const p = s.pts;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i], b = p[i + 1];
      if (a.x === b.x) continue;
      if ((x - a.x) * (x - b.x) <= 0 && !(x === b.x && i < p.length - 2)) {
        const y = a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
        hits.push({ key: s.id + ':' + k++, inst: s.inst, y });
      }
    }
  }
  return hits;
}

function updateVoices(hits) {
  const seen = new Set();
  for (const h of hits) {
    if (voices.size >= 24 && !voices.has(h.key)) continue;
    seen.add(h.key);
    const midi = degreeToMidi(yToDegree(h.y));
    const v = voices.get(h.key);
    if (v) v.setMidi(midi);
    else voices.set(h.key, new Voice(h.inst, midi));
  }
  for (const [key, v] of voices) {
    if (!seen.has(key)) { v.stop(); voices.delete(key); }
  }
}

// ---------------------------------------------------------------------------
// Teilen: die Zeichnung steckt komplett im URL-Hash, kein Server nötig.
//   Format:  #d=<bpm>-<base64url>
//   Binär:   [Version=1] dann je Strich: [Farbe 1B][Punktzahl 2B][Punkte à 3B]
//            Punkt = x (12 Bit) | y (12 Bit), also 4096 Stufen je Achse.
// ---------------------------------------------------------------------------
const Q = 4095;
const quantize = (v) => Math.round(Math.min(1, Math.max(0, v)) * Q) / Q;

// Ramer-Douglas-Peucker: entfernt Punkte, die kaum von der Linie abweichen
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1e-9;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i].x - dx * pts[i].y + b.x * a.y - b.y * a.x) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= eps) return [a, b];
  return simplify(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplify(pts.slice(idx), eps));
}

function encodeDrawing(strokes) {
  const bytes = [1];
  for (const s of strokes) {
    const n = Math.min(s.pts.length, 0xffff);
    bytes.push(s.inst, n >> 8, n & 0xff);
    for (let i = 0; i < n; i++) {
      const x = Math.round(s.pts[i].x * Q), y = Math.round(s.pts[i].y * Q);
      bytes.push(x >> 4, ((x & 0xf) << 4) | (y >> 8), y & 0xff);
    }
  }
  let bin = '';
  for (const v of bytes) bin += String.fromCharCode(v);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeDrawing(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const b = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  if (b[0] !== 1) throw new Error('Unbekannte Version');
  const strokes = [];
  let i = 1;
  while (i + 3 <= b.length) {
    const inst = b[i], n = (b[i + 1] << 8) | b[i + 2];
    i += 3;
    if (inst >= INSTRUMENTS.length || i + n * 3 > b.length) throw new Error('Ungültige Daten');
    const pts = [];
    for (let k = 0; k < n; k++, i += 3) {
      pts.push({ x: ((b[i] << 4) | (b[i + 1] >> 4)) / Q, y: (((b[i + 1] & 0xf) << 8) | b[i + 2]) / Q });
    }
    if (pts.length > 1) strokes.push({ id: nextId++, inst, pts });
  }
  return strokes;
}

function drawingUrl() {
  const base = location.href.split('#')[0];
  return state.strokes.length ? `${base}#d=${state.bpm}-${encodeDrawing(state.strokes)}` : base;
}

// Adresszeile immer aktuell halten: Neuladen oder URL kopieren behält die Zeichnung
function syncUrl() {
  history.replaceState(null, '', drawingUrl());
}

function loadFromUrl() {
  const m = location.hash.match(/^#d=(\d{2,3})-([A-Za-z0-9_-]*)$/);
  if (!m) return false;
  try {
    const strokes = decodeDrawing(m[2]);
    stopAllVoices();
    state.strokes = strokes;
    setBpm(parseInt(m[1], 10));
    return strokes.length > 0;
  } catch (e) {
    console.warn('Link konnte nicht gelesen werden:', e);
    return false;
  }
}

async function share() {
  syncUrl();
  const url = drawingUrl();
  // navigator.share muss direkt im Klick laufen, sonst blockiert iOS es
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Music Drawer', url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('Link kopiert');
  } catch (e) {
    showLinkPanel(url);
  }
}

// Rückfall, wenn weder Teilen-Menü noch Zwischenablage erlaubt sind
// (z. B. In-App-Browser): Link sichtbar und markierbar anzeigen
function showLinkPanel(url) {
  ui.linkInput.value = url;
  ui.linkPanel.hidden = false;
  ui.linkInput.focus();
  ui.linkInput.setSelectionRange(0, url.length);
}

let toastTimer = 0;
function toast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1800);
}

// ---------------------------------------------------------------------------
// Darstellung
// ---------------------------------------------------------------------------
const ui = {
  canvas: document.getElementById('canvas'),
  stage: document.getElementById('stage'),
  hint: document.getElementById('hint'),
  play: document.getElementById('play'),
  bpm: document.getElementById('bpm'),
  palette: document.getElementById('palette'),
  instName: document.getElementById('instName'),
  instFx: document.getElementById('instFx'),
  toast: document.getElementById('toast'),
  linkPanel: document.getElementById('linkPanel'),
  linkInput: document.getElementById('linkInput'),
};
const g2d = ui.canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
let gridLayer = null;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  const r = ui.stage.getBoundingClientRect();
  W = Math.round(r.width * DPR);
  H = Math.round(r.height * DPR);
  ui.canvas.width = W;
  ui.canvas.height = H;
  gridLayer = renderGrid();
}

function renderGrid() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const sub = 2;
  for (let i = 1; i < COLS * sub; i++) {
    const x = Math.round((i / (COLS * sub)) * W) + 0.5;
    g.strokeStyle = i % (sub * 8) === 0 ? '#cfcac2' : i % sub === 0 ? '#e6e2dc' : '#f1eee9';
    g.lineWidth = DPR;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }
  for (let j = 1; j < ROWS * sub; j++) {
    const y = Math.round((j / (ROWS * sub)) * H) + 0.5;
    g.strokeStyle = j % sub === 0 ? '#e6e2dc' : '#f1eee9';
    g.lineWidth = DPR;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  return c;
}

function drawStroke(s) {
  const p = s.pts;
  if (!p.length) return;
  g2d.strokeStyle = INSTRUMENTS[s.inst].color;
  g2d.lineWidth = 3.5 * DPR;
  g2d.lineCap = 'round';
  g2d.lineJoin = 'round';
  g2d.beginPath();
  g2d.moveTo(p[0].x * W, p[0].y * H);
  for (let i = 1; i < p.length; i++) g2d.lineTo(p[i].x * W, p[i].y * H);
  if (p.length === 1) g2d.lineTo(p[0].x * W + 0.1, p[0].y * H);
  g2d.stroke();
}

function frame() {
  const pos = playheadPos();
  const hits = state.playing ? intersections(pos) : [];
  if (state.playing) updateVoices(hits);

  g2d.clearRect(0, 0, W, H);
  g2d.drawImage(gridLayer, 0, 0);
  state.strokes.forEach(drawStroke);
  if (state.current) drawStroke(state.current);

  const x = pos * W;
  g2d.strokeStyle = '#1d1d1f';
  g2d.lineWidth = 1.5 * DPR;
  g2d.beginPath(); g2d.moveTo(x, 0); g2d.lineTo(x, H); g2d.stroke();

  g2d.fillStyle = '#1d1d1f';
  for (const h of hits) {
    g2d.beginPath();
    g2d.arc(x, h.y * H, 4.5 * DPR, 0, Math.PI * 2);
    g2d.fill();
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// Eingabe
// ---------------------------------------------------------------------------
function toNorm(e) {
  const r = ui.canvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
    y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
  };
}

ui.canvas.addEventListener('pointerdown', (e) => {
  if (state.current) return;
  ui.canvas.setPointerCapture(e.pointerId);
  if (!state.playing) setPlaying(true);
  ui.hint.classList.add('hidden');
  const p = toNorm(e);
  state.current = { id: nextId++, inst: state.inst, pts: [p] };
  previewVoice = new Voice(state.inst, degreeToMidi(yToDegree(p.y)));
});

ui.canvas.addEventListener('pointermove', (e) => {
  if (!state.current) return;
  const p = toNorm(e);
  const pts = state.current.pts;
  const last = pts[pts.length - 1];
  if (Math.hypot((p.x - last.x) * W, (p.y - last.y) * H) < 3 * DPR) return;
  pts.push(p);
  if (previewVoice) previewVoice.setMidi(degreeToMidi(yToDegree(p.y)));
});

function endStroke() {
  if (!state.current) return;
  const s = state.current;
  state.current = null;
  if (s.pts.length > 1) {
    // ~1,5 px Toleranz; gespeichert wird exakt das, was auch im Link landet
    s.pts = simplify(s.pts, 1.5 / ui.stage.clientWidth).map((p) => ({ x: quantize(p.x), y: quantize(p.y) }));
    state.strokes.push(s);
    syncUrl();
  }
  if (previewVoice) { previewVoice.stop(); previewVoice = null; }
}
ui.canvas.addEventListener('pointerup', endStroke);
ui.canvas.addEventListener('pointercancel', endStroke);

document.getElementById('play').addEventListener('click', () => setPlaying(!state.playing));
document.getElementById('undo').addEventListener('click', () => { state.strokes.pop(); syncUrl(); });
document.getElementById('clear').addEventListener('click', () => { state.strokes = []; stopAllVoices(); syncUrl(); });
document.getElementById('share').addEventListener('click', share);
document.getElementById('linkClose').addEventListener('click', () => { ui.linkPanel.hidden = true; });
document.getElementById('linkCopy').addEventListener('click', () => {
  ui.linkInput.setSelectionRange(0, ui.linkInput.value.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  toast(ok ? 'Link kopiert' : 'Link markiert – bitte manuell kopieren');
});
document.getElementById('slower').addEventListener('click', () => { setBpm(state.bpm - 5); syncUrl(); });
document.getElementById('faster').addEventListener('click', () => { setBpm(state.bpm + 5); syncUrl(); });

function selectInstrument(i, hear) {
  state.inst = i;
  [...ui.palette.children].forEach((b, j) => b.classList.toggle('selected', j === i));
  ui.instName.textContent = INSTRUMENTS[i].name;
  ui.instFx.textContent = INSTRUMENTS[i].fx;
  if (hear) {
    initAudio();
    if (ctx.state !== 'running') ctx.resume();
    audition(i);
  }
}

INSTRUMENTS.forEach((inst, i) => {
  const b = document.createElement('button');
  b.className = 'swatch';
  b.style.background = inst.color;
  b.setAttribute('aria-label', inst.name);
  b.addEventListener('click', () => selectInstrument(i, true));
  ui.palette.appendChild(b);
});

window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.playing) setPlaying(false);
});

window.addEventListener('hashchange', () => {
  if (location.href !== drawingUrl()) loadFromUrl();
});

document.getElementById('version').textContent = `${APP_VERSION} Prototyp · Music Drawer`;
selectInstrument(state.inst, false);
if (loadFromUrl()) ui.hint.textContent = 'Tippe ▶ zum Anhören';
resize();
requestAnimationFrame(frame);
