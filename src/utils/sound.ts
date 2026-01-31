let audioCtx: AudioContext | null = null;

/**
 * Plays a short, pleasant "beep" using the Web Audio API.
 * No external sound file needed.
 */
export function playScanSound() {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Two-tone beep: quick rising tone
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // Audio not available — fail silently
  }
}
