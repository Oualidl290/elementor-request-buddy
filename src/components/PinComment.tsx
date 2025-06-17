
import React, { useState } from 'react';
import { MessageCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Comment } from '@/services/commentsService';

interface PinCommentProps {
  comment: Comment;
  x: number;
  y: number;
  onReply?: (parentId: string, replyText: string) => void;
  onResolve?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PinComment: React.FC<PinCommentProps> = ({
  comment,
  x,
  y,
  onReply,
  onResolve,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleResolve = () => {
    if (onResolve) {
      onResolve(comment.id);
    }
  };

  return (
    <div 
      className="absolute z-10"
      style={{ left: x, top: y }}
    >
      {/* Pin indicator */}
      <div 
        className={`w-4 h-4 rounded-full cursor-pointer ${
          comment.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'
        } border-2 border-white shadow-lg flex items-center justify-center`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MessageCircle className="w-2 h-2 text-white" />
      </div>

      {/* Comment popup */}
      {isExpanded && (
        <Card className="absolute top-6 left-0 w-80 shadow-xl z-20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-700">{comment.comment}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                {comment.status === 'open' && (
                  <Button
                    onClick={handleResolve}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}

                <Button
                  onClick={() => setIsReplying(!isReplying)}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                >
                  Reply
                </Button>

                {comment.status === 'resolved' && (
                  <span className="text-xs text-green-600 font-medium">
                    Resolved
                  </span>
                )}
              </div>

              {isReplying && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-16 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReply}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Send
                    </Button>
                    <Button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyText('');
                      }}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
