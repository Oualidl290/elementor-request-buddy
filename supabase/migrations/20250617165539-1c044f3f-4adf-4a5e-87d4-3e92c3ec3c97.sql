
-- First drop all policies that depend on client_id
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can view comments" ON public.comments;
DROP POLICY IF EXISTS "Project members can create comments" ON public.comments;
DROP POLICY IF EXISTS "Comment authors can update their comments" ON public.comments;

-- Drop indexes that depend on the columns
DROP INDEX IF EXISTS idx_projects_client_id;
DROP INDEX IF EXISTS idx_comments_user_id;

-- Now we can safely modify the tables
ALTER TABLE public.projects 
DROP COLUMN client_id,
ADD COLUMN client_secret TEXT;

ALTER TABLE public.comments
DROP COLUMN user_id,
ADD COLUMN user_name TEXT;

-- Create new RLS policies for projects
CREATE POLICY "Designers can view their projects" 
  ON public.projects 
  FOR SELECT 
  USING (designer_id = auth.uid());

CREATE POLICY "Designers can update their projects" 
  ON public.projects 
  FOR UPDATE 
  USING (designer_id = auth.uid());

-- Create new RLS policies for comments
CREATE POLICY "Anyone can view comments for accessible projects" 
  ON public.comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND designer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create comments for accessible projects" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND designer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can update comments for accessible projects" 
  ON public.comments 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND designer_id = auth.uid()
    )
  );
