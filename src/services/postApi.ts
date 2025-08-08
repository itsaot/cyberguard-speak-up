import { getAuthHeaders } from '@/utils/auth';

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
    user: {
      _id: string;
      username: string;
    };
    text: string;
    createdAt: string;
    likes?: string[];
    replies?: Array<{
      _id: string;
      user: {
        _id: string;
        username: string;
      };
      text: string;
      createdAt: string;
      likes?: string[];
    }>;
  }>;
  flagged: boolean;
}

interface CommentRequest {
  userId: string;
  text: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
  userId: string;
  type?: string;
  tags?: string[];
  adviceRequested?: boolean;
  isAnonymous?: boolean;
}

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

export const postApi = {
  // Get all posts
  getPosts: async (): Promise<PostResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return response.json();
  },

  // Create a new post
  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    return response.json();
  },

  // Like/unlike a post
  toggleLike: async (postId: string, userId?: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    
    return response.json();
  },

  // Add a comment to a post
  addComment: async (postId: string, commentData: CommentRequest): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    
    return response.json();
  },

  // Delete a comment
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },

  // Flag a post
  flagPost: async (postId: string, reason: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/flag`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to flag post');
    }
  },

  // Delete a post (admin only)
  deletePost: async (postId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  },

  // Get flagged posts (admin only)
  getFlaggedPosts: async (): Promise<PostResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/posts/flagged`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Admin access required');
      }
      if (response.status === 404) {
        throw new Error('Flagged posts endpoint not found');
      }
      throw new Error(`Failed to fetch flagged posts: ${response.status}`);
    }
    
    return response.json();
  },

  // Like a comment
  toggleCommentLike: async (postId: string, commentId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to like comment');
    }
    
    return response.json();
  },

  // React to a post with emoji
  reactToPost: async (postId: string, emoji: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/react`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to react to post');
    }
  },

  // Add reply to comment
  addCommentReply: async (postId: string, commentId: string, userId: string, text: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add reply');
    }
    
    return response.json();
  },
};

export type { PostResponse, CommentRequest, CreatePostRequest };