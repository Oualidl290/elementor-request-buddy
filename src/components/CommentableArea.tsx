
import React, { useState, useRef } from 'react';
import { PinComment } from './PinComment';
import { Comment, commentsService } from '@/services/commentsService';
import { useToast } from '@/hooks/use-toast';

interface CommentableAreaProps {
  projectId: string;
  comments: Comment[];
  onCommentsUpdate: () => void;
  children: React.ReactNode;
  userName?: string; // Optional user name for comments
}

export const CommentableArea: React.FC<CommentableAreaProps> = ({
  projectId,
  comments,
  onCommentsUpdate,
  children,
  userName = 'Anonymous'
}) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleAreaClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNewCommentPosition({ x, y });
    setIsAddingComment(true);
  };

  const handleAddComment = async () => {
    if (!newCommentPosition || !commentText.trim()) return;

    try {
      await commentsService.createComment({
        project_id: projectId,
        x: newCommentPosition.x,
        y: newCommentPosition.y,
        comment: commentText,
        user_name: userName
      });

      setIsAddingComment(false);
      setNewCommentPosition(null);
      setCommentText('');
      onCommentsUpdate();
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReply = async (parentId: string, replyText: string) => {
    const parentComment = comments.find(c => c.id === parentId);
    if (!parentComment) return;

    try {
      await commentsService.createComment({
        project_id: projectId,
        x: parentComment.x,
        y: parentComment.y,
        comment: replyText,
        user_name: userName,
        parent_id: parentId
      });

      onCommentsUpdate();
      
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully."
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await commentsService.updateCommentStatus(commentId, 'resolved');
      onCommentsUpdate();
      
      toast({
        title: "Comment resolved",
        description: "The comment has been marked as resolved."
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: "Error",
        description: "Failed to resolve comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      onClick={handleAreaClick}
    >
      {children}

      {/* Render existing comments */}
      {comments.map((comment) => (
        <PinComment
          key={comment.id}
          comment={comment}
          x={comment.x}
          y={comment.y}
          onReply={handleReply}
          onResolve={handleResolve}
        />
      ))}

      {/* New comment form */}
      {isAddingComment && newCommentPosition && (
        <div
          className="absolute z-20 bg-white border rounded-lg shadow-lg p-4 w-80"
          style={{ 
            left: newCommentPosition.x, 
            top: newCommentPosition.y 
          }}
        >
          <div className="space-y-3">
            <textarea
              placeholder="Add your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-2 border rounded min-h-20 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddComment}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Add Comment
              </button>
              <button
                onClick={() => {
                  setIsAddingComment(false);
                  setNewCommentPosition(null);
                  setCommentText('');
                }}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
