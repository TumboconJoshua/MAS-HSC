-- Simplified Vestment Checker Schema

CREATE TABLE IF NOT EXISTS server_vestments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id uuid REFERENCES servers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Alb Details
  alb_condition text DEFAULT 'good' CHECK (alb_condition IN ('good', 'damaged', 'laundry', 'lost')),
  alb_size text,
  alb_remarks text,

  -- Cincture Details
  cincture_condition text DEFAULT 'good' CHECK (cincture_condition IN ('good', 'damaged', 'laundry', 'lost')),
  cincture_size text,
  cincture_remarks text,

  -- Amice Details
  amice_condition text DEFAULT 'good' CHECK (amice_condition IN ('good', 'damaged', 'laundry', 'lost')),
  amice_remarks text,

  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE server_vestments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Server vestments viewable by authenticated users" ON server_vestments
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage server vestments" ON server_vestments
  FOR ALL USING (auth.role() = 'authenticated');
