import { getAuthHeaders } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

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
};