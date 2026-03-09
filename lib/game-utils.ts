import { exercises, Exercise } from './exercises';

export interface RoundResult {
  roundNumber: number;
  exercise: Exercise;
  score: number;
  feedbackText: string;
  canvasImage: string;
}

export type GamePhase = 'START' | 'CHOOSE' | 'DRAW' | 'FEEDBACK' | 'CERTIFICATE';

export function pickTwoRandomExercises(usedIds: string[]): [Exercise, Exercise] {
  const available = exercises.filter((ex) => !usedIds.includes(ex.id));
  const pool = available.length >= 2 ? available : [...exercises];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function calculateAverageScore(rounds: RoundResult[]): number {
  if (rounds.length === 0) return 0;
  const sum = rounds.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / rounds.length) * 10) / 10;
}

export function getPerformanceLabel(avg: number): string {
  if (avg >= 9) return 'Hervorragend';
  if (avg >= 7) return 'Sehr gut';
  if (avg >= 5) return 'Gut';
  if (avg >= 3) return 'Befriedigend';
  return 'Weiter üben';
}
