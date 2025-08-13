import { getAuthHeaders, authenticatedFetch } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

interface ReportData {
  title?: string;
  description: string;
  type: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  platform?: string;
  evidence?: string;
  isAnonymous?: boolean;
  flagged?: boolean;
}

interface Report {
  _id: string;
  title?: string;
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
  // Create a new report (anonymous or authenticated)
  createReport: async (reportData: ReportData): Promise<Report> => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create report: ${response.status} - ${errorText}`);
    }
    return response.json();
  },

  // Get all reports (admin only)
  getReports: async (): Promise<Report[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  // Flag a report (admin only)
  flagReport: async (reportId: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to flag report');
  },

  // Delete a report (admin only)
  deleteReport: async (reportId: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete report');
  },

  // React to a report with emoji
  reactToReport: async (reportId: string, emoji: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}/react`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (!response.ok) throw new Error('Failed to react to report');
  },

  // Get flagged reports (admin only)
  getFlaggedReports: async (): Promise<Report[]> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/flagged`);
    if (!response.ok) throw new Error('Failed to fetch flagged reports');
    return response.json();
  },

  // Get single report (admin only)
  getReport: async (reportId: string): Promise<Report> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  // Update report progress/status (admin only)
  updateReportProgress: async (reportId: string, message: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to update report progress');
  },

  // Add update to report (admin only)
  addReportUpdate: async (reportId: string, message: string): Promise<void> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/reports/${reportId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to add report update');
  },
};

export type { Report, ReportData };
