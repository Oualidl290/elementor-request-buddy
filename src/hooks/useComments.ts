
import { useState, useEffect } from 'react';
import { commentsService, Comment } from '@/services/commentsService';

export const useComments = (projectId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await commentsService.getComments(projectId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments
  };
};
