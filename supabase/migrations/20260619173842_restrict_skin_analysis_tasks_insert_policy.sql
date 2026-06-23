/*
# Restrict skin_analysis_tasks INSERT policy

## Problem
The `anon_insert_tasks` policy used `WITH CHECK (true)`, allowing any anon or
authenticated client to insert rows directly into the table — effectively
bypassing row-level security.

## Fix
Drop the permissive INSERT policy entirely. All inserts are performed by the
`analyze-skin` edge function using the service role key, which bypasses RLS
anyway. No direct client insert should be permitted.

The SELECT policy (`anon_select_tasks`) is kept so the frontend can poll for
its task result by task_id.
*/

DROP POLICY IF EXISTS "anon_insert_tasks" ON skin_analysis_tasks;
