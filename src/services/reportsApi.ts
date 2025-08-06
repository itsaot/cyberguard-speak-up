import { getAuthHeaders } from '@/utils/auth';

const API_BASE_URL = 'https://srv-d29pig2dbo4c739kjurg.onrender.com/api';

interface ReportData {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  platform?: string;
  evidence?: string;
  isAnonymous?: boolean;
  flagged?: boolean;
}

interface Report {
  _id: string;
  type: string;
  severity: string;
  description: string;
  location?: string;
  platform?: string;
  evidence?: string;
  isAnonymous: boolean;
  flagged: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  createdBy: string;
  createdAt: string;
  reactions: Array<{
    emoji: string;
    userId: string;
    username: string;
  }>;
  updates: Array<{
    _id: string;
    message: string;
    createdAt: string;
    createdBy: string;
  }>;
}

export const reportsApi = {
  // Create a new report
  createReport: async (reportData: ReportData): Promise<Report> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    
    return response.json();
  },

  // Get all reports (admin only)
  getReports: async (): Promise<Report[]> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return response.json();
  },

  // Flag a report
  flagReport: async (reportId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/flag`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to flag report');
    }
  },

  // Delete a report (admin only)
  deleteReport: async (reportId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },

  // Add reaction to report
  reactToReport: async (reportId: string, emoji: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/react`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to react to report');
    }
  },

  // Add update to report
  addReportUpdate: async (reportId: string, message: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add report update');
    }
  },
};

export type { Report, ReportData };