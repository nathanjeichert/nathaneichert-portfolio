// Data model typedefs (JSDoc). No runtime code — this file documents the shapes
// that flow through the app; editors pick these up for checking/completion.

/**
 * One rule from rules.json.
 * @typedef {Object} Rule
 * @property {string} id             Permanent ID, e.g. "CRP-R12". All persistent state keys on this.
 * @property {string} deck           Deck code (CIV, CMP, CON, KTR, CORP, CRL, CRP, EVI, PRF, REA, REM, TOR, TRU, WIL, AGP).
 * @property {number} num            1-based position in the deck.
 * @property {string} section        The `##` section heading the rule sits under.
 * @property {string} prompt         Recall prompt.
 * @property {string[]} core         Memorized skeleton, display lines.
 * @property {string[]} bare         Hint stage 1: first letters of each CORE word.
 * @property {string[]} guided       Hint stage 2: connectors restored, content words blanked.
 * @property {string} prose          Sentence-form recitation (may be "").
 * @property {string} tip            Exam tip (may be "").
 * @property {string} name           Famous-name anchor (may be "").
 * @property {string} subject        Themis chart subject.
 * @property {string} area           Themis chart topic area.
 * @property {'T1'|'T2'|'T3'} tier
 * @property {number} subject_freq
 * @property {number} area_freq
 * @property {number} subject_weight
 * @property {number} area_weight
 * @property {number} static_priority  (subject_weight/100)*(area_weight/100)*tier_factor.
 */

/**
 * The whole bundle.
 * @typedef {Object} Bundle
 * @property {string} generated
 * @property {string} exam_date
 * @property {number} schema_version
 * @property {Object<string, number>} subject_frequency
 * @property {Object<string, number>} subject_weight
 * @property {Object<string, Object<string, number>>} area_frequency
 * @property {Object<string, Object<string, number>>} area_weight
 * @property {Object<string, number>} tier_factor
 * @property {Object<string, {title: string, checklist: string[]}>} decks
 * @property {Rule[]} rules
 */

/**
 * Append-only log entries (IndexedDB store "log").
 * Review:  { t:'r', id, ts, g, h }  g = raw grade 1-9, h = hints used 0-2.
 * Undo:    { t:'u', ts }            tombstone; cancels the latest un-undone review.
 * @typedef {{t:'r', id:string, ts:number, g:number, h:number} | {t:'u', ts:number}} LogEntry
 */

/**
 * Derived per-card scheduling state (folded from the log; never stored).
 * @typedef {Object} CardState
 * @property {number} seen       Times reviewed.
 * @property {number} ease
 * @property {number} interval   ms
 * @property {number} lastTs
 * @property {number} lastGrade  Raw grade of latest review.
 * @property {number} due        lastTs + interval.
 * @property {number} lapses     Reviews graded <=3.
 * @property {number[]} grades   All raw grades, oldest first.
 * @property {number} hints      Total hints used across reviews.
 */

/**
 * Exported/imported state file.
 * @typedef {Object} ExportFile
 * @property {string} app          "barrules"
 * @property {number} version
 * @property {string} exported     ISO timestamp.
 * @property {LogEntry[]} log
 * @property {Object<string,string>} tierOverrides  id -> 'T1'|'T2'|'T3'.
 * @property {string[]} deleteFlags
 * @property {Object<string,number>} introProgress  deck -> next rule index (deck.length = introduced).
 * @property {Object} settings
 */

export {};
