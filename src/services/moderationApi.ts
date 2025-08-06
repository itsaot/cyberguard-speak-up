import { getAuthHeaders } from '@/utils/auth';

const API_BASE_URL = 'https://srv-d29pig2dbo4c739kjurg.onrender.com/api';

export const moderationApi = {
  // Flag a post for moderation
  flagPost: async (postId: string, reason?: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/moderation/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to flag post for moderation');
    }
  },

  // Add reaction to post
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
};