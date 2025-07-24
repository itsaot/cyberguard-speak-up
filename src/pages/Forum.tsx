import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ForumPost {
  _id: string;
  type: 'physical' | 'verbal' | 'cyber';
  content: string;
  author?: string;
  tags?: string[];
  adviceRequested?: boolean;
  isAnonymous?: boolean;
  createdAt: string;
}

const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState({
    type: '',
    content: '',
    author: '',
    tags: '',
    adviceRequested: false,
    isAnonymous: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://cybergaurd-backend-2.onrender.com/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
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
      const requestBody = {
        type: newPost.type,
        content: newPost.content.trim(),
        author: "Anonymous",
        isAnonymous: true,
        tags: newPost.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        adviceRequested: newPost.adviceRequested,
      };

      const response = await fetch('https://cybergaurd-backend-2.onrender.com/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${errorText}`);
      }

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setNewPost({
        type: '',
        content: '',
        author: '',
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
            <Card key={post._id}>
              <CardContent className="pt-6">
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
                  {post.isAnonymous && (
                    <span className="text-xs text-muted-foreground">Anonymous</span>
                  )}
                </div>
                <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-muted px-2 py-1 rounded-md text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 text-xs">
                  {post.adviceRequested && (
                    <span className="text-primary font-medium">Advice Requested</span>
                  )}
                  {post.author && !post.isAnonymous && (
                    <span className="text-muted-foreground">by {post.author}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;
