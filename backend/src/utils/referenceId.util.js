/**
 * Generates a human-friendly complaint reference ID like: CLN-7F3K9Q
 * Not cryptographically unique on its own — combined with Mongo's unique index
 * on referenceId, a collision just triggers a regenerate-and-retry in the caller.
 */
export const generateReferenceId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CLN-${code}`;
};
