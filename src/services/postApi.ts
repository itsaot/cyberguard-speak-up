import { authenticatedFetch } from '@/utils/auth';

interface PostResponse {
  _id: string;
  type: 'physical' | 'verbal' | 'cyber' | 'general';
  content: string;
  tags: string[];
  adviceRequested: boolean;
  escalated: boolean;
  isAnonymous: boolean;
  createdBy: string;
  createdAt: string;
  likes: string[];
  reactions?: Array<{
    emoji: string;
    userId: string;
    username: string;
  }>;
  comments: Array<{
    _id: string;
    user: { _id: string; username: string };
    text: string;
    createdAt: string;
    likes?: string[];
    replies?: Array<{
      _id: string;
      user: { _id: string; username: string };
      text: string;
      createdAt: string;
      likes?: string[];
    }>;
  }>;
  flagged: boolean;
}

interface CommentRequest {
  userId?: string;
  text: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
  userId?: string;
  type?: string;
  tags?: string[];
  adviceRequested?: boolean;
  isAnonymous?: boolean;
}

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

export const postApi = {
  // Get all posts (public)
  getPosts: async (): Promise<PostResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Create a new post (anonymous or authenticated)
  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Like/unlike a post (anonymous possible)
  toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to toggle like: ${response.status} - ${errorText}`);
    }
    return response.json();
  },

  // Add a comment (anonymous possible)
  addComment: async (postId: string, commentData: CommentRequest) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add comment: ${response.status} - ${errorText}`);
    }
    return response.json();
  },

  // Add reply to a comment (anonymous possible)
  addCommentReply: async (postId: string, commentId: string, replyData: CommentRequest) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData),
    });
    if (!response.ok) throw new Error('Failed to add reply');
    return response.json();
  },

  // React to a post with emoji (anonymous possible)
  reactToPost: async (postId: string, emoji: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) throw new Error('Failed to react to post');
    return response.json();
  },

  // Flag a post (anonymous possible)
  flagPost: async (postId: string, reason: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to flag post');
    return response.json();
  },

  // Delete a post (admin only, still protected)
  deletePost: async (postId: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
  },

  // Delete a comment (optional, keep admin-only for safety)
  deleteComment: async (postId: string, commentId: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  // Get flagged posts (admin only)
  getFlaggedPosts: async (): Promise<PostResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/posts/flagged`);
    if (!response.ok) throw new Error(`Failed to fetch flagged posts: ${response.status}`);
    return response.json();
  },
};

export type { PostResponse, CommentRequest, CreatePostRequest };

