
-- Drop existing RLS policies that require authentication
DROP POLICY IF EXISTS "Anyone can view comments for accessible projects" ON public.comments;
DROP POLICY IF EXISTS "Anyone can create comments for accessible projects" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update comments for accessible projects" ON public.comments;

-- Create new policies that allow public/anon access
CREATE POLICY "Public can insert comments" 
  ON public.comments 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view comments" 
  ON public.comments 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Public can update comments" 
  ON public.comments 
  FOR UPDATE 
  TO public
  USING (true);

-- Also ensure the projects table allows public read access for basic info
DROP POLICY IF EXISTS "Designers can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Designers can update their projects" ON public.projects;

CREATE POLICY "Public can view projects" 
  ON public.projects 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Designers can update their projects" 
  ON public.projects 
  FOR UPDATE 
  USING (designer_id = auth.uid());
