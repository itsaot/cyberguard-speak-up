import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Flag, Users, TrendingUp, Eye, CheckCircle, XCircle, MessageSquare, UserPlus, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import stopBullyingBanner from "@/assets/stop-bullying-banner.jpg";
import supportHands from "@/assets/support-hands.jpg";
import FlaggedPostsManager from '@/components/FlaggedPostsManager';
import { postApi, PostResponse } from '@/services/postApi';
import { reportsApi, Report } from '@/services/reportsApi';



const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    flaggedReports: 0,
    totalPosts: 0,
    flaggedPosts: 0,
  });
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [users, setUsers] = useState([
    { id: '1', username: 'john_doe', email: 'john@example.com', role: 'user' },
    { id: '2', username: 'jane_smith', email: 'jane@example.com', role: 'user' },
    { id: '3', username: 'admin_user', email: 'admin@example.com', role: 'admin' },
  ]);

  // Redirect if not admin - after all hooks are called
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch reports and posts using the proper API services
      const [reportsData, postsData] = await Promise.all([
        reportsApi.getReports(),
        postApi.getPosts()
      ]);
      
      setReports(reportsData);
      setPosts(postsData);
      
      // Calculate stats
      const flaggedPostsCount = postsData.filter(post => post.flagged).length;
      
      setStats({
        totalReports: reportsData.length,
        flaggedReports: reportsData.filter((r: Report) => r.flagged).length,
        totalPosts: postsData.length,
        flaggedPosts: flaggedPostsCount,
      });
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
      await reportsApi.flagReport(reportId);
      fetchDashboardData(); // Refresh data
      toast({
        title: "Report Flagged",
        description: "The report has been flagged for review.",
      });
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

  const handleCreateAdmin = () => {
    toast({
      title: "Backend Required",
      description: "User management requires backend functionality. Enable Lovable Cloud to use this feature.",
      variant: "destructive",
    });
  };

  const handlePromoteUser = (userId: string) => {
    toast({
      title: "Backend Required",
      description: "User management requires backend functionality. Enable Lovable Cloud to use this feature.",
      variant: "destructive",
    });
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: "Backend Required",
      description: "User management requires backend functionality. Enable Lovable Cloud to use this feature.",
      variant: "destructive",
    });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <MessageSquare className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged Posts</p>
                <p className="text-2xl font-bold">{stats.flaggedPosts}</p>
              </div>
              <Flag className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Incident Reports</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Posts</TabsTrigger>
          <TabsTrigger value="forum">All Forum Posts</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
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
                            Reported {report.createdAt ? format(new Date(report.createdAt), 'MMM d, yyyy at h:mm a') : 'Unknown date'}
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

        {/* Flagged Posts Tab */}
        <TabsContent value="flagged">
          <FlaggedPostsManager />
        </TabsContent>

        {/* All Forum Posts Tab */}
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
                <Card key={post._id} className={post.flagged ? 'border-orange-200 bg-orange-50/30' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{post.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(post.createdAt), 'MMM d, yyyy at h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {post.isAnonymous && (
                          <Badge variant="outline" className="text-xs">Anonymous</Badge>
                        )}
                        {post.flagged && (
                          <Badge variant="destructive" className="text-xs">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                    
                    {/* Post Stats */}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t pt-3">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments?.length || 0} comments</span>
                      </span>
                      <span>{post.likes?.length || 0} likes</span>
                      {post.adviceRequested && (
                        <span className="text-primary font-medium">Advice Requested</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <div className="space-y-6">
            {/* Notice */}
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Backend Required</h3>
                    <p className="text-sm text-muted-foreground">
                      User management features require backend functionality. This is a preview of the interface.
                      Enable Lovable Cloud to activate these features with secure API endpoints.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create New Admin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New Admin Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="admin_user"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateAdmin} className="w-full md:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* All Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
                        {user.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePromoteUser(user.id)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Promote to Admin
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;