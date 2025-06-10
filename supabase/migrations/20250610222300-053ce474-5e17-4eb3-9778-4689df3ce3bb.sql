
-- Create the edit_requests table
CREATE TABLE public.edit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  section_id TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  replies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by TEXT
);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update the updated_at field
CREATE TRIGGER update_edit_requests_updated_at 
  BEFORE UPDATE ON public.edit_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.edit_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert new requests (client-side submissions)
CREATE POLICY "Anyone can create edit requests" 
  ON public.edit_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Only authenticated users can read requests (designers)
CREATE POLICY "Authenticated users can view edit requests" 
  ON public.edit_requests 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy: Only authenticated users can update requests (designers)
CREATE POLICY "Authenticated users can update edit requests" 
  ON public.edit_requests 
  FOR UPDATE 
  TO authenticated 
  USING (true);
