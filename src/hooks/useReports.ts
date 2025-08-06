import { useState, useEffect } from 'react';
import { reportsApi, Report } from '@/services/reportsApi';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [flaggedReports, setFlaggedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getReports();
      setReports(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlaggedReports = async () => {
    try {
      const data = await reportsApi.getFlaggedReports();
      setFlaggedReports(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load flagged reports.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReports();
    fetchFlaggedReports();
  }, []);

  const createReport = async (reportData: any) => {
    try {
      await reportsApi.createReport(reportData);
      await fetchReports();
      toast({
        title: "Report submitted",
        description: "Your incident report has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report.",
        variant: "destructive",
      });
    }
  };

  const flagReport = async (reportId: string): Promise<void> => {
    try {
      await reportsApi.flagReport(reportId);
      await fetchReports();
      await fetchFlaggedReports();
      toast({
        title: "Report flagged",
        description: "The report has been flagged for review.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to flag report.",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId: string): Promise<void> => {
    try {
      await reportsApi.deleteReport(reportId);
      setReports(prev => prev.filter(report => report._id !== reportId));
      setFlaggedReports(prev => prev.filter(report => report._id !== reportId));
      toast({
        title: "Report deleted",
        description: "The report has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  const reactToReport = async (reportId: string, emoji: string): Promise<void> => {
    try {
      await reportsApi.reactToReport(reportId, emoji);
      await fetchReports();
      toast({
        title: "Reaction added",
        description: `You reacted with ${emoji}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add reaction.",
        variant: "destructive",
      });
    }
  };

  const updateReportProgress = async (reportId: string, message: string) => {
    try {
      await reportsApi.updateReportProgress(reportId, message);
      await fetchReports();
      toast({
        title: "Progress updated",
        description: "Report progress has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  return {
    reports,
    flaggedReports,
    isLoading,
    fetchReports,
    fetchFlaggedReports,
    createReport,
    flagReport,
    deleteReport,
    reactToReport,
    updateReportProgress,
  };
};