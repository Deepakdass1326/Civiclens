/**
 * Static routing table: issue type -> government department.
 * Deliberately deterministic (not AI-guessed) so routing is 100% predictable
 * and auditable — this table is the extensibility point for future admin config.
 */
const ROUTING_TABLE = {
  pothole: "PWD (Public Works Department)",
  garbage: "Municipal Corporation (Sanitation)",
  illegal_dumping: "Municipal Corporation (Sanitation)",
  broken_streetlight: "Electricity / Street Lighting Department",
  water_leakage: "Jal Board / Water Board",
  fallen_tree: "Municipal Corporation (Horticulture/Disaster)",
  other: "General Municipal Helpline",
};

export function routeToDepartment(issueType) {
  return ROUTING_TABLE[issueType] || ROUTING_TABLE.other;
}

export { ROUTING_TABLE };
