// api/postApi.ts
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
  text: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
  type?: string;
  tags?: string[];
  adviceRequested?: boolean;
  isAnonymous?: boolean;
}

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

export const postApi = {
  getPosts: async (): Promise<PostResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getPostById: async (postId: string): Promise<PostResponse> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to toggle like: ${response.status} - ${text}`);
    }
    return response.json();
  },

  addComment: async (postId: string, commentData: CommentRequest) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to add comment: ${response.status} - ${text}`);
    }
    return response.json();
  },

  addCommentReply: async (postId: string, commentId: string, replyData: CommentRequest) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
    if (!response.ok) throw new Error('Failed to add reply');
    return response.json();
  },

  reactToPost: async (postId: string, emoji: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) throw new Error('Failed to react to post');
    return response.json();
  },

  flagPost: async (postId: string, reason: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to flag post');
    return response.json();
  },

  deletePost: async (postId: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
  },

  deleteComment: async (postId: string, commentId: string) => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  getFlaggedPosts: async (): Promise<PostResponse[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/posts/flagged`);
    if (!response.ok) throw new Error(`Failed to fetch flagged posts: ${response.status}`);
    return response.json();
  },
};

export type { PostResponse, CommentRequest, CreatePostRequest };
