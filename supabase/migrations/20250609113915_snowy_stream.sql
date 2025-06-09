/*
  # RentWise Database Schema

  1. New Tables
    - `property_types` - Lookup table for property types (apartment, house, etc.)
    - `properties` - Core property information with soft delete support
    - `tenants` - Tenant details with contact information
    - `leases` - Rental agreements linking properties and tenants
    - `financial_categories` - Lookup table for income/expense categories
    - `financials` - All income and expense transactions
    - `user_properties` - Join table for multi-tenant property access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their data
    - Proper indexing for performance

  3. Features
    - Soft delete support with deleted_at timestamps
    - Audit trails with created_at/updated_at
    - JSONB for flexible contact information
    - Proper foreign key relationships
*/

-- Create property types lookup table
CREATE TABLE IF NOT EXISTS property_types (
  type_id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Insert default property types
INSERT INTO property_types (name) VALUES 
  ('apartment'),
  ('house'),
  ('condo'),
  ('townhouse'),
  ('studio'),
  ('duplex')
ON CONFLICT (name) DO NOTHING;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  type_id INTEGER REFERENCES property_types(type_id),
  size_sqm FLOAT,
  purchase_date DATE,
  current_value_dkk DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  lease_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent_dkk DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create financial categories lookup table
CREATE TABLE IF NOT EXISTS financial_categories (
  category_id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
);

-- Insert default financial categories
INSERT INTO financial_categories (name, type) VALUES 
  ('rental_income', 'income'),
  ('deposit', 'income'),
  ('other_income', 'income'),
  ('loan_payment', 'expense'),
  ('property_tax', 'expense'),
  ('insurance', 'expense'),
  ('maintenance', 'expense'),
  ('utilities', 'expense'),
  ('management_fees', 'expense'),
  ('repairs', 'expense'),
  ('advertising', 'expense'),
  ('legal_fees', 'expense'),
  ('other_expense', 'expense')
ON CONFLICT (name) DO NOTHING;

-- Create financials table
CREATE TABLE IF NOT EXISTS financials (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES financial_categories(category_id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount_dkk DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_properties join table for multi-tenant support
CREATE TABLE IF NOT EXISTS user_properties (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, property_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at);
CREATE INDEX IF NOT EXISTS idx_leases_property_id_start_date ON leases(property_id, start_date);
CREATE INDEX IF NOT EXISTS idx_leases_deleted_at ON leases(deleted_at);
CREATE INDEX IF NOT EXISTS idx_financials_property_id_date ON financials(property_id, date);
CREATE INDEX IF NOT EXISTS idx_financials_type ON financials(type);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties
CREATE POLICY "Users can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for tenants
CREATE POLICY "Users can read own tenants"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tenants"
  ON tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tenants"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own tenants"
  ON tenants
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for leases
CREATE POLICY "Users can read leases for own properties"
  ON leases
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leases for own properties"
  ON leases
  FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leases for own properties"
  ON leases
  FOR UPDATE
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leases for own properties"
  ON leases
  FOR DELETE
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for financials
CREATE POLICY "Users can read financials for own properties"
  ON financials
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert financials for own properties"
  ON financials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update financials for own properties"
  ON financials
  FOR UPDATE
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete financials for own properties"
  ON financials
  FOR DELETE
  TO authenticated
  USING (
    property_id IN (
      SELECT property_id FROM properties WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for user_properties
CREATE POLICY "Users can read own property associations"
  ON user_properties
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own property associations"
  ON user_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own property associations"
  ON user_properties
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financials_updated_at BEFORE UPDATE ON financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();