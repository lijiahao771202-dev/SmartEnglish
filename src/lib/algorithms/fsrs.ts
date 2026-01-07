export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface FSRSReview {
    rating: Rating;
    delta_t: number; // Time since last review (days)
}

export interface CardState {
    stability: number;   // Memory strength (days for 90% retention)
    difficulty: number;  // 1-10 (1=easy, 10=hard)
    reps: number;        // Total reviews
    lapses: number;      // Times forgotten
    state: 'new' | 'learning' | 'review' | 'relearning';
    last_review: number; // Timestamp
    due: number;         // Timestamp
}

const PARAMS = {
    w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
    request_retention: 0.9,
    max_interval: 365,
};

/**
 * Simplified FSRS v4 Calculation
 */
export const fsrs = {
    /**
     * Create initial state for a new card
     */
    createEmptyState: (): CardState => ({
        stability: 0,
        difficulty: 0,
        reps: 0,
        lapses: 0,
        state: 'new',
        last_review: Date.now(),
        due: Date.now(), // Due immediately
    }),

    /**
     * Calculate next state based on rating
     */
    schedule: (current: CardState, rating: Rating, now: number = Date.now()): CardState => {
        const next = { ...current };
        next.last_review = now;
        next.reps += 1;

        if (current.state === 'new') {
            next.state = 'learning';
            next.difficulty = initDifficulty(rating);
            next.stability = initStability(rating);
        } else {
            // Updated difficulty
            next.difficulty = nextDifficulty(current.difficulty, rating);

            // Updated stability
            const elapsedDays = (now - current.last_review) / (1000 * 60 * 60 * 24);
            const retrievability = Math.exp(Math.log(0.9) * elapsedDays / current.stability);

            if (rating === 'again') {
                next.state = 'relearning';
                next.lapses += 1;
                next.stability = nextForgetStability(current.difficulty, current.stability, retrievability);
            } else {
                next.state = 'review';
                next.stability = nextRecallStability(current.difficulty, current.stability, retrievability, rating);
            }
        }

        // Calculate next interval
        const nextInterval = Math.min(
            PARAMS.max_interval,
            Math.max(1, Math.round(next.stability * 9 * (1 / PARAMS.request_retention - 1)))
        ); // Simplified Interval Formula

        // If 'again', due in 5 minutes (approx 0.003 days), ignoring stability theory for immediate urgency
        if (rating === 'again') {
            next.due = now + 5 * 60 * 1000;
        } else if (rating === 'hard') {
            next.due = now + 12 * 60 * 60 * 1000; // 12 hours
        } else {
            next.due = now + nextInterval * 24 * 60 * 60 * 1000;
        }

        return next;
    }
};

// --- Helper Math Functions (Simplified from FSRS rs/go implementations) ---

function initStability(r: Rating): number {
    switch (r) {
        case 'again': return PARAMS.w[0];
        case 'hard': return PARAMS.w[1];
        case 'good': return PARAMS.w[2];
        case 'easy': return PARAMS.w[3];
    }
}

function initDifficulty(r: Rating): number {
    switch (r) {
        case 'again': return 10; // Max diff
        case 'hard': return 7;
        case 'good': return 5;
        case 'easy': return 3;
    }
}

function nextDifficulty(d: number, r: Rating): number {
    let nextD = d - PARAMS.w[6] * (ratingToGrade(r) - 3);
    nextD = Math.min(10, Math.max(1, nextD));
    return nextD;
}

function nextRecallStability(d: number, s: number, retrievability: number, r: Rating): number {
    const hardPenalty = r === 'hard' ? PARAMS.w[15] : 1;
    const easyBonus = r === 'easy' ? PARAMS.w[16] : 1;

    // S' = S * (1 + exp(...) * ...)
    return s * (1 + Math.exp(PARAMS.w[8]) *
        (11 - d) *
        Math.pow(s, -PARAMS.w[9]) *
        (Math.exp((1 - retrievability) * PARAMS.w[10]) - 1) *
        hardPenalty *
        easyBonus);
}

function nextForgetStability(d: number, s: number, r: number): number {
    // S' = min(S, ...) simplified forget
    return Math.min(s, PARAMS.w[11] * Math.pow(d, -PARAMS.w[12]) * (Math.pow(s + 1, PARAMS.w[13]) - 1) * Math.exp((1 - r) * PARAMS.w[14]));
}

function ratingToGrade(r: Rating): number {
    switch (r) {
        case 'again': return 1;
        case 'hard': return 2;
        case 'good': return 3;
        case 'easy': return 4;
    }
}
