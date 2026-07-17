// All tuning knobs for the Bar Rules app live in this file.
// Times are milliseconds unless a name says otherwise.

export const MIN = 60 * 1000;
export const DAY = 24 * 60 * 60 * 1000;

// Scheduler (SM-2-lite + priority x urgency selection). See IMPLEMENTATION_BRIEF §5.
export const SCHED = {
  START_EASE: 2.2,
  EASE_MIN: 1.3,
  EASE_MAX: 2.8,
  EASE_FAIL: -0.15,          // grade 1-3
  EASE_PASS: +0.05,          // grade 7-9
  FAIL_INTERVAL: 10 * MIN,   // grade 1-3 -> re-serve soon
  FIRST_PASS: 1 * DAY,       // first clean recall
  SECOND_PASS: 3 * DAY,      // second clean recall
  HARD_MULT: 1.2,            // grade 4-6
  INTERVAL_CAP: 5 * DAY,     // ~2 weeks to exam; never schedule further out
  NEW_URGENCY: 1.0,          // fixed urgency for never-seen cards
  URGENCY_CAP: 4.0,          // overdue ratio clamp
  NEW_RATIO: 0.30,           // share of new cards while unseen T1s remain in pool
  NEW_RATIO_TAPER: 0.12,     // share of new cards after that
  SUBJECT_BLEND: 0.20,       // weight of subject mean in expected grade (weak prior)
  NEUTRAL_GRADE: 6,
  SUBJECT_EWMA_ALPHA: 0.25,  // per-subject rolling grade mean
  SUBJECT_DEFICIT_SCALE: 3,  // how fast deficit saturates the boost
  WEAK_BOOST_MAX: 0.35,      // max urgency multiplier bonus for weak subjects
  STALE_AFTER: 3 * DAY,      // subject prior applies to unseen or stale cards
  JITTER: 0.06,              // +-6% random tie-break on selection scores
  RESERVE_GAP: 6,            // failed card re-enters the session this many cards later
  // Hints imply weaker recall: cap the *effective* grade used for scheduling
  // (index = hints used). The raw grade is still what gets logged/displayed.
  HINT_GRADE_CAP: [9, 7, 6],
};

// Continuous scheduling (the default): no intervals — every card is always
// eligible, ranked by exam value x how much it needs work x how recently seen.
export const CONT = {
  TARGET_GRADE: 8,          // "needs work" is distance from this
  WEAKNESS_FLOOR: 0.06,     // strong cards never fully drop out of rotation
  RESEEN_RAMP: 30 * MIN,    // a just-seen card ramps back to full need over this window
  FAIL_RAMP: 10 * MIN,      // cards averaging <=3.5 ramp back much faster
  FAIL_AVG: 3.5,
  RESEEN_MIN: 0.02,         // floor so nothing is ever fully excluded
  NEW_NEED: 0.85,           // unseen cards' need: just above a rested failing card (0.75),
                            // far above anything you can already recite
};

export const SESSION_DEFAULT_LENGTH = 'endless';
export const SESSION_LENGTH_CHOICES = [[10, '10'], [25, '25'], [40, '40'], ['endless', '∞']];
export const ENDLESS_CHUNK = 25;   // queue build/refill size in endless sessions
export const DAILY_GOAL_DEFAULT = 50;
export const INTRO_SECONDS_PER_RULE = 7;   // for "Intro Torts first (~9 min)" estimates
export const WEAKEST_LIST_SIZE = 20;
export const EXPORT_REMINDER = { days: 4, minReviews: 20 };

export const DB_NAME = 'barrules';
export const LS_PREFIX = 'barrules.';

export const BREAK_REMINDER_CHOICES = [[0, 'Off'], [25, '25m'], [45, '45m']];

export const DEFAULT_SETTINGS = {
  theme: 'system',          // system | light | sepia | dark
  textScale: 100,           // % of base type size (80–150 via the Settings stepper)
  lineSpacing: 'normal',    // normal | relaxed | loose
  bionic: false,            // fast-reading: bold word starts in rule/FRO text
  breakEvery: 25,           // minutes of continuous drilling before a nudge (0 = off)
  scheduling: 'continuous', // continuous (no intervals; always serve the best card) | spaced (SM-2-lite)
  sessionLength: SESSION_DEFAULT_LENGTH,   // number | 'endless'
  includeT3: false,
  requireIntro: true,       // scheduler serves new cards only from introduced decks
  sound: false,
  haptics: true,
  dailyGoal: DAILY_GOAL_DEFAULT,
  subjectFilter: '',        // '' = all decks
};

export const GRADE_LABELS = {
  low: 'Couldn’t produce it',
  mid: 'Partial / prompted',
  high: 'Clean recitation',
};
