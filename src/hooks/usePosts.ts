import { useState, useEffect } from 'react';
import { postApi, PostResponse } from '@/services/postApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePosts = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await postApi.getPosts();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleLike = async (postId: string, userId?: string) => {
    try {
      const userIdToUse = userId || user?.id;
      const result = await postApi.toggleLike(postId, userIdToUse);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: result.liked 
                  ? [...post.likes, userIdToUse || 'anonymous-user'] // Add user to likes
                  : post.likes.filter(id => id !== (userIdToUse || 'anonymous-user')) // Remove user from likes
              }
            : post
        )
      );

      toast({
        title: result.liked ? "Post liked!" : "Like removed",
        description: `You ${result.liked ? 'liked' : 'unliked'} this post.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like.",
        variant: "destructive",
      });
    }
  };

  const addComment = async (postId: string, text: string, userId?: string) => {
    try {
      // Use the actual user ID from auth context for proper MongoDB ObjectId
      const userIdToSend = userId || user?.id;
      if (!userIdToSend) {
        throw new Error('User must be logged in to comment');
      }
      
      const newComment = await postApi.addComment(postId, { userId: userIdToSend, text });
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );

      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please make sure you're logged in.",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    try {
      await postApi.deleteComment(postId, commentId);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                comments: post.comments.filter(comment => comment._id !== commentId)
              }
            : post
        )
      );

      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  const flagPost = async (postId: string, reason: string) => {
    try {
      await postApi.flagPost(postId, reason);
      
      toast({
        title: "Post flagged",
        description: "Thank you for reporting. This post will be reviewed by our moderation team.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag post.",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));

      toast({
        title: "Post deleted",
        description: "The post has been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  const reactToPost = async (postId: string, emoji: string) => {
    try {
      await postApi.reactToPost(postId, emoji);
      
      // Refetch posts to get updated reactions
      await fetchPosts();
      
      toast({
        title: "Reaction added",
        description: `Reacted with ${emoji}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction.",
        variant: "destructive",
      });
    }
  };

  return {
    posts,
    isLoading,
    fetchPosts,
    toggleLike,
    addComment,
    deleteComment,
    flagPost,
    deletePost,
    reactToPost,
  };
};