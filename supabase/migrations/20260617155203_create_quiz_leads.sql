CREATE TABLE quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  skin_type text,
  age_group text,
  pores integer,
  wrinkles integer,
  dark_circles integer,
  dehydration integer,
  dark_spots integer,
  primary_concern text,
  key_strength text
);

ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public lead capture form, no auth)
CREATE POLICY "anon_insert_quiz_leads" ON quiz_leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only service_role can read leads (admin/backend use only)
CREATE POLICY "service_role_select_quiz_leads" ON quiz_leads
  FOR SELECT TO service_role
  USING (true);
