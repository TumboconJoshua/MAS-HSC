-- Create treasury tables

CREATE TABLE IF NOT EXISTS treasury_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  description text,
  reference text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treasury_balance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_balance numeric(12,2) DEFAULT 0,
  set_at timestamptz DEFAULT now(),
  set_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS Policies
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Treasury transactions viewable by authenticated users" ON treasury_transactions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage treasury transactions" ON treasury_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Treasury balance viewable by authenticated users" ON treasury_balance
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage treasury balance" ON treasury_balance
  FOR ALL USING (auth.role() = 'authenticated');
