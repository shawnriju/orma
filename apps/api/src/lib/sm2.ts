export type Rating = 'hard' | 'ok' | 'easy';

const QUALITY_MAP: Record<Rating, number> = {
  hard: 1,
  ok: 3,
  easy: 5,
};

interface CardSRSState {
  interval_days: number;
  ease_factor: number;
  repetitions: number;
}

interface SRSResult {
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review_at: Date;
}

export function computeNextInterval(card: CardSRSState, rating: Rating): SRSResult {
  const q = QUALITY_MAP[rating];

  let newInterval: number;
  let newRepetitions: number;

  if (q < 3) {
    newInterval = 1;
    newRepetitions = 0;
  } else {
    newRepetitions = card.repetitions + 1;
    if (card.repetitions === 0) {
      if (q === 5) newInterval = 5;
      else if (q === 3) newInterval = 3;
      else newInterval = 1;
    } else if (card.repetitions === 1) {
      if (q === 5) newInterval = 7;
      else if (q === 3) newInterval = 4;
      else newInterval = 3;
    } else {
      newInterval = Math.round(card.interval_days * card.ease_factor);
      if (q === 5) newInterval = Math.round(newInterval * 1.2);
    }
  }

  const newEaseFactor = Math.max(
    1.3,
    card.ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  return {
    interval_days: newInterval,
    ease_factor: newEaseFactor,
    repetitions: newRepetitions,
    next_review_at: new Date(Date.now() + newInterval * 86400 * 1000),
  };
}

// Preview helper — use this on the frontend to show "In ~3 days" hints
// before the user has tapped a rating button
export function previewIntervals(card: CardSRSState): Record<Rating, number> {
  return {
    hard: computeNextInterval(card, 'hard').interval_days,
    ok: computeNextInterval(card, 'ok').interval_days,
    easy: computeNextInterval(card, 'easy').interval_days,
  };
}
