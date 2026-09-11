/**
 * Shared "is this basically the same product?" check — a tenant re-uploading
 * the same item (a repeated CSV row, the same photo dropped into a batch
 * again, or just retyping a reference that already exists) should be told
 * so and not end up with two rows for it. Matches on name OR reference,
 * case/whitespace-insensitive, since either one repeating usually means the
 * same real-world product, not a coincidence.
 */

export function normalizeForDuplicateCheck(value: string): string {
  return value.trim().toLowerCase();
}

export interface DuplicateCandidate {
  name: string;
  reference: string;
}

export interface DuplicateCandidateRecord extends DuplicateCandidate {
  id: string;
}

/** `excludeId` lets editing a product compare against every OTHER product without flagging itself. */
export function findDuplicateProduct<T extends DuplicateCandidateRecord>(
  existingProducts: T[],
  candidate: DuplicateCandidate,
  excludeId?: string,
): T | null {
  const name = normalizeForDuplicateCheck(candidate.name);
  const reference = normalizeForDuplicateCheck(candidate.reference);
  return (
    existingProducts.find(
      (p) =>
        p.id !== excludeId &&
        (normalizeForDuplicateCheck(p.reference) === reference || normalizeForDuplicateCheck(p.name) === name),
    ) ?? null
  );
}
