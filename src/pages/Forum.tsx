import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, MessageSquare } from 'lucide-react';
import { postApi } from '@/services/postApi';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';

const Forum = () => {
  const { user } = useAuth();
  const { 
    posts, 
    isLoading, 
    fetchPosts,
    toggleLike,
    addComment,
    deleteComment,
    flagPost,
    deletePost,
  } = usePosts();

  const [newPost, setNewPost] = useState({
    type: '',
    content: '',
    tags: '',
    adviceRequested: false,
    isAnonymous: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newPost.type || !newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Type and content are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        type: newPost.type,
        content: newPost.content.trim(),
        tags: newPost.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        adviceRequested: newPost.adviceRequested,
        isAnonymous: newPost.isAnonymous,
      };

      await postApi.createPost(postData);

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setNewPost({
        type: '',
        content: '',
        tags: '',
        adviceRequested: false,
        isAnonymous: true,
      });

      setShowForm(false);
      fetchPosts();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading forum posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Community Forum</h1>
            <p className="text-muted-foreground">
              Share your experiences, offer support, and connect with others in our safe space.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      {/* New Post Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={newPost.type} onValueChange={(value) => setNewPost(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="verbal">Verbal</SelectItem>
                    <SelectItem value="cyber">Cyber</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="example: bullying, school"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adviceRequested"
                  checked={newPost.adviceRequested}
                  onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, adviceRequested: checked as boolean }))}
                />
                <Label htmlFor="adviceRequested">Advice Requested</Label>
              </div>


              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !newPost.type || !newPost.content.trim()}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a conversation in our community forum.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onToggleLike={toggleLike}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
              onFlagPost={flagPost}
              onDeletePost={deletePost}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;
