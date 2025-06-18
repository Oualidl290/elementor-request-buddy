
-- First, let's ensure the profiles table has the correct structure for designer signup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update the handle_new_user function to properly handle designer signup with project creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_project_id TEXT;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, role, project_id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'designer'),
    NEW.raw_user_meta_data ->> 'project_id',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );

  -- If user is a designer and has project data, create the project
  IF (NEW.raw_user_meta_data ->> 'role') = 'designer' AND 
     (NEW.raw_user_meta_data ->> 'project_name') IS NOT NULL AND
     (NEW.raw_user_meta_data ->> 'project_url') IS NOT NULL THEN
    
    -- Generate project ID if not provided
    new_project_id := COALESCE(
      NEW.raw_user_meta_data ->> 'project_id',
      'proj_' || encode(gen_random_bytes(8), 'hex')
    );
    
    -- Insert the project
    INSERT INTO public.projects (
      id, 
      name, 
      url, 
      designer_id, 
      created_by,
      slug
    ) VALUES (
      new_project_id,
      NEW.raw_user_meta_data ->> 'project_name',
      NEW.raw_user_meta_data ->> 'project_url',
      NEW.id,
      NEW.email,
      LOWER(REPLACE(NEW.raw_user_meta_data ->> 'project_name', ' ', '-'))
    );
    
    -- Update the profile with the actual project_id
    UPDATE public.profiles 
    SET project_id = new_project_id 
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_project_id ON public.profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON public.projects(designer_id);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Designers can create projects" ON public.projects;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow designers to create and manage their projects
CREATE POLICY "Designers can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = designer_id);
