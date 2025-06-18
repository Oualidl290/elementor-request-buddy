
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  url: string;
  client_secret: string | null;
  designer_id: string;
  created_at: string;
  created_by: string;
  slug: string | null;
}

export interface CreateProjectData {
  name: string;
  url: string;
  client_secret?: string;
  designer_id: string;
  created_by: string;
  slug?: string;
}

export const projectsService = {
  // Get all projects for the current user (designer)
  async getProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('designer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  },

  // Get a single project by ID (with designer verification)
  async getProject(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('designer_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    return data;
  },

  // Create a new project (authenticated users only)
  async createProject(projectData: Omit<CreateProjectData, 'designer_id' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fullProjectData = {
      ...projectData,
      designer_id: user.id,
      created_by: user.email || 'Unknown'
    };

    console.log('Creating project with data:', fullProjectData);
    
    const { data, error } = await supabase
      .from('projects')
      .insert([fullProjectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    console.log('Project created successfully:', data);
    return data;
  },

  // Update a project (only by owner)
  async updateProject(id: string, updates: Partial<Omit<CreateProjectData, 'designer_id' | 'created_by'>>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('designer_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  },

  // Delete a project (only by owner)
  async deleteProject(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('designer_id', user.id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};
