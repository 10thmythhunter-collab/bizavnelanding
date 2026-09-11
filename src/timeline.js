// The hero's chip intro runs on its own clock. Anything that has to wait for
// it reads these instead of restating the numbers, so the two components
// can't drift out of sync.

export const RETRACT_AT = 4000;
export const RETRACT_MS = 500;
export const STEP_MS = 2000;

// The chips are back behind the first one and the carousel has taken over —
// the point where the intro is done and the stage is free.
export const HERO_INTRO_END = RETRACT_AT + RETRACT_MS;
