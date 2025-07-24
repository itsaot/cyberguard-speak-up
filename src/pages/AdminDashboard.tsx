import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Flag, Users, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import stopBullyingBanner from "@/assets/stop-bullying-banner.jpg";
import supportHands from "@/assets/support-hands.jpg";

interface Report {
  _id: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  reportedAt: string;
  status: string;
  flagged: boolean;
}

interface ForumPost {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    flaggedReports: 0,
    totalPosts: 0,
  });
  const { toast } = useToast();

  // Redirect if not admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('cyberguard_token');
      
      // Fetch reports
      const reportsResponse = await fetch('https://cybergaurd-backend-2.onrender.com/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Fetch forum posts
      const postsResponse = await fetch('https://cybergaurd-backend-2.onrender.com/api/posts');
      
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
        
        // Calculate stats
        setStats({
          totalReports: reportsData.length,
          pendingReports: reportsData.filter((r: Report) => r.status === 'pending').length,
          flaggedReports: reportsData.filter((r: Report) => r.flagged).length,
          totalPosts: 0, // Will be updated when posts are fetched
        });
      }
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
        setStats(prev => ({ ...prev, totalPosts: postsData.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlagReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('cyberguard_token');
      const response = await fetch(`https://cybergaurd-backend-2.onrender.com/api/reports/${reportId}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
        toast({
          title: "Report Flagged",
          description: "The report has been flagged for review.",
        });
      }
    } catch (error) {
      console.error('Error flagging report:', error);
      toast({
        title: "Error",
        description: "Failed to flag the report.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return '👊';
      case 'verbal': return '🗣️';
      case 'social': return '👥';
      case 'cyber': return '💻';
      case 'discrimination': return '⚖️';
      case 'harassment': return '⚠️';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor reports, manage content, and oversee community activity.
            </p>
          </div>
          <img src={supportHands} alt="Support and kindness" className="h-20 w-20 rounded-lg object-cover" />
        </div>
        
        {/* Banner */}
        <div className="relative rounded-lg overflow-hidden mb-6">
          <img src={stopBullyingBanner} alt="Stop bullying awareness banner" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-white text-xl font-semibold">Together We Stop Bullying</h2>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
              <Eye className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged Reports</p>
                <p className="text-2xl font-bold">{stats.flaggedReports}</p>
              </div>
              <Flag className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forum Posts</p>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Incident Reports</TabsTrigger>
          <TabsTrigger value="forum">Forum Posts</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reports submitted</h3>
                  <p className="text-muted-foreground">
                    When incidents are reported, they will appear here for review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(report.type)}</span>
                        <div>
                          <CardTitle className="text-lg capitalize">{report.type} Bullying</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Reported {report.reportedAt ? format(new Date(report.reportedAt), 'MMM d, yyyy at h:mm a') : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(report.severity)} className="capitalize">
                          {report.severity}
                        </Badge>
                        {report.flagged && (
                          <Badge variant="destructive">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {report.location && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Location:</strong> {report.location}
                      </p>
                    )}
                    <p className="text-foreground mb-4">{report.description}</p>
                    <div className="flex justify-end space-x-2">
                      {!report.flagged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagReport(report._id)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag for Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Forum Posts Tab */}
        <TabsContent value="forum">
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No forum posts</h3>
                  <p className="text-muted-foreground">
                    Community posts will appear here when users start sharing.
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Anonymous</p>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy at h:mm a') : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;