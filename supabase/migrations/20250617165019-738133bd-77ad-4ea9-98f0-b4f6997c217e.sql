
-- Create users table for both clients and designers
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('client', 'designer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table for Elementor pages being reviewed
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for pins and threaded feedback
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  comment TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
  parent_id UUID NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for projects table
CREATE POLICY "Project members can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (client_id = auth.uid() OR designer_id = auth.uid());

CREATE POLICY "Designers can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (designer_id = auth.uid());

CREATE POLICY "Project members can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (client_id = auth.uid() OR designer_id = auth.uid());

-- RLS Policies for comments table
CREATE POLICY "Project members can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND (client_id = auth.uid() OR designer_id = auth.uid())
    )
  );

CREATE POLICY "Project members can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
      AND (client_id = auth.uid() OR designer_id = auth.uid())
    )
  );

CREATE POLICY "Comment authors can update their comments" 
  ON public.comments 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_designer_id ON public.projects(designer_id);
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
