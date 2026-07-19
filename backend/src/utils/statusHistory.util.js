/**
 * Appends a new status entry to an existing history array, immutably.
 * Kept as a pure function (no Mongoose document mutation) so it's testable
 * in isolation and reusable anywhere a status transition needs recording.
 *
 * @param {Array<{status: string, changedAt: Date}>} existingHistory
 * @param {string} newStatus
 * @param {Date} [at] - defaults to now, overridable for deterministic tests
 */
export function appendStatusHistory(existingHistory = [], newStatus, at = new Date()) {
  return [...existingHistory, { status: newStatus, changedAt: at }];
}

/**
 * Prevents redundant history entries when the status isn't actually changing
 * (e.g. clicking "resolved" twice shouldn't double-log it).
 */
export function shouldRecordStatusChange(existingHistory, newStatus) {
  if (!existingHistory || existingHistory.length === 0) return true;
  const last = existingHistory[existingHistory.length - 1];
  return last.status !== newStatus;
}
