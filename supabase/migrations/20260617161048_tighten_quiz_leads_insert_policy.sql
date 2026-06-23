/*
# Tighten quiz_leads anonymous INSERT policy

1. Security Changes
   - Drops the existing `anon_insert_quiz_leads` policy which used an always-true WITH CHECK.
   - Replaces it with a constrained policy that requires:
     - `name` must be a non-empty trimmed string.
     - `email` must be a non-empty trimmed string matching a basic email pattern.
   - This prevents empty or junk rows from being inserted via the public anon key.
*/

DROP POLICY IF EXISTS "anon_insert_quiz_leads" ON quiz_leads;

CREATE POLICY "anon_insert_quiz_leads" ON quiz_leads
  FOR INSERT TO anon
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );
