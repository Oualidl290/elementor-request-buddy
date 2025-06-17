
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  x: number;
  y: number;
  comment: string;
  status: 'open' | 'resolved';
  parent_id?: string | null;
  created_at: string;
}

export interface CreateCommentData {
  project_id: string;
  x: number;
  y: number;
  comment: string;
  parent_id?: string | null;
}

export const commentsService = {
  // Get all comments for a project
  async getComments(projectId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return (data || []) as Comment[];
  },

  // Create a new comment
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create comments');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        ...commentData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    return data as Comment;
  },

  // Update comment status
  async updateCommentStatus(id: string, status: 'open' | 'resolved'): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }

    return data as Comment;
  },

  // Delete a comment
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get replies for a comment
  async getReplies(parentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }

    return (data || []) as Comment[];
  }
};
