/*
# Create skin_analysis_tasks table

1. New Tables
   - `skin_analysis_tasks`
     - `id` (uuid, primary key) — the task_id returned to the client
     - `status` (text) — 'pending', 'success', or 'error'
     - `result` (jsonb, nullable) — full analysis result when status is 'success'
     - `error_message` (text, nullable) — error description when status is 'error'
     - `created_at` (timestamptz) — when the task was submitted

2. Security
   - RLS enabled.
   - Anon + authenticated can SELECT (to poll for results) and INSERT (edge function uses service role, but anon needs read).
   - No UPDATE/DELETE from client — only the edge function (via service role) updates rows.
*/

CREATE TABLE IF NOT EXISTS skin_analysis_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  result jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skin_analysis_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON skin_analysis_tasks;
CREATE POLICY "anon_select_tasks" ON skin_analysis_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON skin_analysis_tasks;
CREATE POLICY "anon_insert_tasks" ON skin_analysis_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
