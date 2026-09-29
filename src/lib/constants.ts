export const APP_NAME = "SQR CLIMB";
export const TICKER = "$SQR";
export const TAGLINE = "How high can you go?";

export const SESSION_COOKIE = "sqr_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PIN_MIN = 4;
export const PIN_MAX = 12;

// Game physics (server-side validation bounds)
export const MAX_REASONABLE_HEIGHT_PER_SECOND = 45; // meters/sec theoretical max
export const MIN_RUN_DURATION_MS = 2000;
export const MAX_RUN_DURATION_MS = 1000 * 60 * 45; // 45 min
export const MAX_HEIGHT_HARD_CAP = 500000; // 500km absolute cap

export const LEADERBOARD_PAGE_SIZE = 25;

export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
