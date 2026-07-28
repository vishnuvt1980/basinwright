-- The collection was renamed from "case studies" to "reference deployments":
-- the pieces are worked designs, not customer engagements, and the enum name
-- was itself the claim. Existing rows are carried over rather than dropped.
BEGIN;
ALTER TYPE "DocKind" RENAME VALUE 'CASE_STUDY' TO 'REFERENCE';
COMMIT;
