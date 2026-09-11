/** Deterministic quiz → competency update. Example: current 52, quiz 80% → after 71 (+19). */
export function quizGain(current: number, percent: number): number {
  const gain = (percent / 100) * 50 * (1 - current / 100);
  return Math.max(0, Math.min(100 - current, Math.round(gain)));
}

/** Deterministic course-completion → competency update. */
export function courseGain(current: number, score: number, hours: number): number {
  const gain = (score / 100) * (25 + Math.min(hours, 15)) * (1 - current / 100) * 0.8;
  return Math.max(0, Math.min(100 - current, Math.round(gain)));
}
