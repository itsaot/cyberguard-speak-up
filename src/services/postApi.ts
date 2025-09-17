import { authenticatedFetch } from '@/utils/auth';
const isAdminUser = (user: User | null) => user?.role === 'admin';

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
    username?: string;
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
  userId?: string;
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
    const res = await fetch(`${API_BASE_URL}/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  getPostById: async (postId: string): Promise<PostResponse> => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  createPost: async (postData: CreatePostRequest): Promise<PostResponse> => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  toggleLike: async (postId: string) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  addComment: async (postId: string, commentData: CommentRequest) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  addCommentReply: async (postId: string, commentId: string, replyData: CommentRequest) => {
     console.log("Reply body being sent:", { ...replyData, text: "this is the reply" });
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData),
    });
    if (!res.ok) throw new Error('Failed to add reply');
    return res.json();
  },

  reactToPost: async (postId: string, emoji: string) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) throw new Error('Failed to react to post');
    const data = await res.json();

    // Convert backend object { userId: emoji } to array for frontend
    const reactionsArray = Object.entries(data.reactions || {}).map(([userId, emoji]) => ({ userId, emoji }));
    return { ...data, reactions: reactionsArray };
  },

  flagPost: async (postId: string, reason: string) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to flag post');
    return res.json();
  },

  deletePost: async (postId: string, isAdmin: boolean = false) => {
    const endpoint = isAdmin ? `${API_BASE_URL}/posts/${postId}` : `${API_BASE_URL}/posts/${postId}/full`;
    const res = await authenticatedFetch(endpoint, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  deleteComment: async (postId: string, commentId: string) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete comment');
  },

  getFlaggedPosts: async (currentUser: User | null): Promise<PostResponse[]> => {
    if (!isAdminUser(currentUser)) throw new Error('Admin access required');

    const res = await authenticatedFetch(`${API_BASE_URL}/posts/flagged`);
    if (!res.ok) throw new Error(`Failed to fetch flagged posts: ${res.status}`);
    return res.json();
  },
};

export type { PostResponse, CommentRequest, CreatePostRequest };
