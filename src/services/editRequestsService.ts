
import { supabase } from '@/integrations/supabase/client';

export interface EditRequest {
  id: string;
  page_url: string;
  section_id?: string | null;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  project_id: string;
  replies: Reply[];
  created_at: string;
  updated_at: string;
  submitted_by?: string | null;
}

export interface Reply {
  id: string;
  message: string;
  timestamp: string;
  from: string;
}

export interface CreateEditRequestData {
  page_url: string;
  section_id?: string | null;
  message: string;
  project_id?: string;
  submitted_by?: string | null;
}

export interface UpdateEditRequestData {
  status?: 'open' | 'in-progress' | 'resolved';
  replies?: Reply[];
}

// Helper function to transform database row to EditRequest
const transformToEditRequest = (row: any): EditRequest => {
  return {
    id: row.id,
    page_url: row.page_url,
    section_id: row.section_id,
    message: row.message,
    status: row.status,
    project_id: row.project_id,
    replies: Array.isArray(row.replies) ? row.replies : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    submitted_by: row.submitted_by,
  };
};

export const editRequestsService = {
  // GET /edit-requests - List all requests with optional filters
  async getEditRequests(filters?: {
    page_url?: string;
    status?: string;
    search?: string;
    project_id?: string;
  }) {
    let query = supabase
      .from('edit_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.page_url && filters.page_url !== 'all') {
      query = query.eq('page_url', filters.page_url);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters?.search) {
      query = query.or(`message.ilike.%${filters.search}%,section_id.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching edit requests:', error);
      throw error;
    }

    return data ? data.map(transformToEditRequest) : [];
  },

  // GET /edit-requests/:id - Get single request
  async getEditRequest(id: string) {
    const { data, error } = await supabase
      .from('edit_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching edit request:', error);
      throw error;
    }

    return transformToEditRequest(data);
  },

  // POST /edit-requests - Create new request (client-side)
  async createEditRequest(requestData: CreateEditRequestData) {
    // Ensure project_id is set, default to empty string to match database default
    const dataToInsert = {
      ...requestData,
      project_id: requestData.project_id || '',
    };

    const { data, error } = await supabase
      .from('edit_requests')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating edit request:', error);
      throw error;
    }

    return transformToEditRequest(data);
  },

  // PATCH /edit-requests/:id - Update request (designer-side)
  async updateEditRequest(id: string, updates: UpdateEditRequestData) {
    // Convert Reply[] to Json for database storage - cast to any to satisfy TypeScript
    const dbUpdates: any = {
      ...updates,
      replies: updates.replies ? JSON.parse(JSON.stringify(updates.replies)) : undefined,
    };

    const { data, error } = await supabase
      .from('edit_requests')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating edit request:', error);
      throw error;
    }

    return transformToEditRequest(data);
  },

  // Helper method to add a reply to an existing request
  async addReply(id: string, replyMessage: string, from: string = 'designer') {
    // First get the current request to get existing replies
    const currentRequest = await this.getEditRequest(id);
    
    const newReply: Reply = {
      id: crypto.randomUUID(),
      message: replyMessage,
      timestamp: new Date().toISOString(),
      from
    };

    const updatedReplies = [...(currentRequest.replies || []), newReply];

    return this.updateEditRequest(id, { replies: updatedReplies });
  }
};
