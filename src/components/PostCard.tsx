import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageSquare, Flag, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { PostResponse, postApi } from '@/services/postApi';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardProps {
  post: PostResponse;
  onToggleLike: (postId: string, userId?: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onFlagPost: (postId: string, reason: string) => void;
  onDeletePost: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onFlagPost,
  onDeletePost,
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isLiked = user ? post.likes?.includes(user.id) || false : false;
  const isAdmin = user?.isAdmin || false;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onAddComment(post._id, newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFlagPost = async () => {
    if (!flagReason) return;
    await onFlagPost(post._id, flagReason);
    setFlagReason('');
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const result = await postApi.toggleCommentLike(post._id, commentId);
      // Since backend endpoints aren't ready, we'll show success feedback for now
      console.log('Comment like toggled:', result);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await postApi.addCommentReply(post._id, commentId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      // Since backend endpoints aren't ready, we'll show success feedback for now
      console.log('Reply added successfully');
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyLike = async (commentId: string, replyId: string) => {
    try {
      // This would need a backend endpoint for reply likes
      console.log('Reply like toggled for reply:', replyId);
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const canDeleteComment = (commentUserId: string) => {
    return isAdmin || (user && user.id === commentUserId);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {/* Post Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm capitalize">{post.type}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), 'MMM d, yyyy at h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.isAnonymous && (
              <span className="text-xs text-muted-foreground">Anonymous</span>
            )}
            {post.flagged && isAdmin && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Flagged
              </span>
            )}
          </div>
        </div>

        {/* Post Content */}
        <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, index) => (
                <span key={index} className="inline-block bg-muted px-2 py-1 rounded-md text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleLike(post._id, user?.id)}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes?.length || 0}</span>
            </Button>

            {/* Comments Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Flag Button - Available for all authenticated users */}
            {user && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                    <Flag className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Flag Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please select a reason for flagging this post. {isAdmin ? 'As an admin, you can flag posts for immediate review.' : 'Our moderation team will review it.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Select value={flagReason} onValueChange={setFlagReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="false-information">False information</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFlagPost} disabled={!flagReason}>
                      Flag Post
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Admin Delete Button */}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this post? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeletePost(post._id)} className="bg-red-600 hover:bg-red-700">
                      Delete Post
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 min-h-[80px]"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {(post.comments?.length || 0) === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                (post.comments || []).map((comment) => (
                  <div key={comment._id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {canDeleteComment(comment.user._id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteComment(post._id, comment._id)}
                          className="text-muted-foreground hover:text-red-500 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-3">{comment.text}</p>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment._id)}
                        className="h-6 p-1 text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{comment.likes?.length || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment._id)}
                        className="h-6 p-1 text-muted-foreground hover:text-primary"
                      >
                        Reply
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <div className="mt-3 ml-4">
                        <div className="flex space-x-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 min-h-[60px] text-sm"
                          />
                          <div className="flex flex-col space-y-1">
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment._id)}
                              disabled={!replyText.trim() || isSubmittingReply}
                              className="h-8"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="bg-background/50 p-2 rounded border-l-2 border-muted">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-xs">{reply.user.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-xs text-foreground mb-2">{reply.text}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReplyLike(comment._id, reply._id)}
                              className="h-5 p-1 text-muted-foreground hover:text-red-500"
                            >
                              <Heart className="h-2 w-2 mr-1" />
                              <span className="text-xs">{reply.likes?.length || 0}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;