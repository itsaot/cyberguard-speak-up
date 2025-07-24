import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Trash2, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { postApi, PostResponse } from '@/services/postApi';
import { useToast } from '@/hooks/use-toast';

const FlaggedPostsManager: React.FC = () => {
  const [flaggedPosts, setFlaggedPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    try {
      setIsLoading(true);
      const data = await postApi.getFlaggedPosts();
      setFlaggedPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load flagged posts.",
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
        title: "Post deleted",
        description: "The flagged post has been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const handleClearFlags = async (postId: string) => {
    // This would need a backend endpoint to clear flags
    // For now, we'll simulate it by removing from the flagged list
    try {
      // You would need to implement this endpoint on your backend
      // await postApi.clearFlags(postId);
      
      setFlaggedPosts(prev => prev.filter(post => post._id !== postId));
      toast({
        title: "Flags cleared",
        description: "The post flags have been cleared and the post remains visible.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear flags.",
        variant: "destructive",
      });
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'physical': return 'bg-red-100 text-red-800';
      case 'verbal': return 'bg-orange-100 text-orange-800';
      case 'cyber': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flagged Posts Management</h2>
          <p className="text-muted-foreground">Review and moderate posts that have been flagged by users</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {flaggedPosts.length} flagged posts
        </Badge>
      </div>

      {flaggedPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No flagged posts</h3>
            <p className="text-muted-foreground">
              Great! There are currently no posts that have been flagged for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flaggedPosts.map((post) => (
            <Card key={post._id} className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-orange-700">Flagged Post</span>
                    </div>
                    <Badge className={getPostTypeColor(post.type)}>
                      {post.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), 'MMM d, yyyy at h:mm a')}
                    </span>
                    {post.isAnonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Post Content */}
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-muted px-2 py-1 rounded-md text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments?.length || 0} comments</span>
                    </span>
                    <span>{post.likes?.length || 0} likes</span>
                    {post.adviceRequested && (
                      <span className="text-primary font-medium">Advice Requested</span>
                    )}
                  </div>
                </div>

                {/* Recent Comments Preview */}
                {(post.comments?.length || 0) > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Recent Comments:</h4>
                    <div className="space-y-2">
                      {(post.comments || []).slice(-2).map((comment) => (
                        <div key={comment._id} className="text-sm">
                          <span className="font-medium">{comment.user.username}:</span>
                          <span className="ml-2 text-muted-foreground">{comment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Choose an action for this flagged post
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* Clear Flags Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Clear Flags
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear Flags</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will clear all flags from this post and keep it visible to users. 
                            Are you sure this post doesn't violate community guidelines?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleClearFlags(post._id)} className="bg-green-600 hover:bg-green-700">
                            Clear Flags
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Delete Post Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the post and all its comments. 
                            This action cannot be undone. Are you sure?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post._id)} className="bg-red-600 hover:bg-red-700">
                            Delete Post
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedPostsManager;