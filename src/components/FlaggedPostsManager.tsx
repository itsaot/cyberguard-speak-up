import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Flag, MessageSquare, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { postApi, PostResponse } from '@/services/postApi';
import { authenticatedFetch } from '@/utils/auth';

const FlaggedPostsManager = () => {
  const [flaggedPosts, setFlaggedPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      setIsLoading(true);
      const posts = await postApi.getFlaggedPosts();
      setFlaggedPosts(posts);
    } catch (error: any) {
      console.error('Error fetching flagged posts:', error);
      const errorMessage = error.message || "Failed to load flagged posts.";
      toast({
        title: "Authentication Error",
        description: errorMessage.includes('401') || errorMessage.includes('token')
          ? "Your session has expired. Please log in again as admin."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      setFlaggedPosts(prev => prev.filter(post => post._id !== postId));
      toast({
        title: "Post Deleted",
        description: "The flagged post has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const handleUnflagPost = async (postId: string) => {
    try {
      const response = await authenticatedFetch(`https://cybergaurdapi.onrender.com/api/posts/${postId}/unflag`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setFlaggedPosts(prev => prev.filter(post => post._id !== postId));
        toast({
          title: "Post Unflagged",
          description: "The post has been unflagged and restored.",
        });
      } else {
        throw new Error('Failed to unflag post');
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to unflag post.";
      toast({
        title: "Authentication Error",
        description: errorMessage.includes('401') || errorMessage.includes('token')
          ? "Your session has expired. Please log in again."
          : errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Flag className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading flagged posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flaggedPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flagged posts</h3>
            <p className="text-muted-foreground">
              Posts flagged for moderation will appear here for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        flaggedPosts.map((post) => (
          <Card key={post._id} className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Flag className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle className="text-lg">Flagged Post</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Posted {format(new Date(post.createdAt), 'MMM d, yyyy at h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">
                    <Flag className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                  {post.isAnonymous && (
                    <Badge variant="outline">Anonymous</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Type:</strong> {post.type}
                </p>
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {/* Post Metadata */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4 border-t pt-3">
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments?.length || 0} comments</span>
                </span>
                <span>{post.likes?.length || 0} likes</span>
                {post.adviceRequested && (
                  <span className="text-primary font-medium">Advice Requested</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnflagPost(post._id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Unflag
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default FlaggedPostsManager;