import { getAuthHeaders } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

interface ChatMessage {
  message: string;
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

export const chatbotApi = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message to chatbot');
    }
    
    return response.json();
  },
};

export type { ChatMessage, ChatResponse };