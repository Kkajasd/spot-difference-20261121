/**
 * audio.js — small WebAudio chimes, no audio files needed.
 *
 * Every sound is a few oscillators through one gain envelope, made on the
 * first user gesture (browsers block audio before one). A muted player, or
 * a browser without WebAudio, stays silent without breaking the game.
 */

let audioCtx = null;
let muted = false;

/** Create the context on a user gesture; safe to call any time. */
export function ensureAudio() {
  if (audioCtx !== null) return;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (Ctor === undefined) return;
    audioCtx = new Ctor();
  } catch {
    audioCtx = null;
  }
}

/** Toggle the mute; returns the new muted state. */
export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One note: an oscillator with a quick attack and a soft decay. */
function note(freq, startAt, length, type, volume) {
  if (audioCtx === null || muted) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startAt);
    osc.stop(startAt + length + 0.05);
  } catch {
    // Audio is decoration; a failure never stops the game.
  }
}

/** A bright two-note chime for a found difference. */
export function playFound() {
  if (audioCtx === null || muted) return;
  const now = audioCtx.currentTime;
  note(660, now, 0.18, 'sine', 0.22);
  note(990, now + 0.09, 0.28, 'sine', 0.2);
}

/** A low buzz for a wrong click. */
export function playMiss() {
  if (audioCtx === null || muted) return;
  const now = audioCtx.currentTime;
  note(160, now, 0.22, 'sawtooth', 0.08);
}

/** A soft shimmer when a hint appears. */
export function playHint() {
  if (audioCtx === null || muted) return;
  const now = audioCtx.currentTime;
  note(880, now, 0.3, 'triangle', 0.12);
  note(1174, now + 0.08, 0.3, 'triangle', 0.1);
}

/** A rising arpeggio for a finished level. */
export function playLevelDone() {
  if (audioCtx === null || muted) return;
  const now = audioCtx.currentTime;
  const steps = [523, 659, 784, 1046];
  steps.forEach((freq, i) => note(freq, now + i * 0.11, 0.3, 'triangle', 0.16));
}

/** A longer fanfare for the finished game. */
export function playWon() {
  if (audioCtx === null || muted) return;
  const now = audioCtx.currentTime;
  const steps = [523, 659, 784, 1046, 784, 1046, 1318];
  steps.forEach((freq, i) => note(freq, now + i * 0.12, 0.34, 'triangle', 0.15));
}
