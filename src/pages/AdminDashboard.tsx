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
import { AlertTriangle, Flag, Users, TrendingUp, Eye, CheckCircle, XCircle, MessageSquare, UserPlus, Shield, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import stopBullyingBanner from "@/assets/stop-bullying-banner.jpg";
import supportHands from "@/assets/support-hands.jpg";
import FlaggedPostsManager from '@/components/FlaggedPostsManager';
import { postApi, PostResponse } from '@/services/postApi';
import { reportsApi, Report } from '@/services/reportsApi';
import { userApi, User as ApiUser, CreateAdminData } from '@/services/userApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



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
  const [newAdmin, setNewAdmin] = useState<CreateAdminData>({
    username: '',
    email: '',
    password: '',
  });
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Redirect if not admin - after all hooks are called
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'admin') return user.role === 'admin';
        if (roleFilter === 'user') return user.role === 'user';
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

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

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await userApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateAdmin = async () => {
  if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
    toast({
      title: "Validation Error",
      description: "Please fill in all fields.",
      variant: "destructive",
    });
    return;
  }

  setIsCreatingAdmin(true);
  try {
    await userApi.createAdmin(newAdmin); // backend sets role: 'admin'
    toast({
      title: "Success",
      description: "Admin account created successfully.",
    });
    setNewAdmin({ username: '', email: '', password: '' });
    fetchUsers(); // ✅ refresh user list to show new admin
  } catch (error) {
    console.error('Error creating admin:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create admin account.",
      variant: "destructive",
    });
  } finally {
    setIsCreatingAdmin(false);
  }
};


const handlePromoteUser = async (userId: string) => {
  try {
    await userApi.promoteToAdmin(userId); // backend updates role: 'admin'
    toast({
      title: "Success",
      description: "User promoted to admin successfully.",
    });
    fetchUsers(); // refresh list
  } catch (error) {
    console.error('Error promoting user:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to promote user.",
      variant: "destructive",
    });
  }
};


  const handleDeleteUser = async (userId: string) => {
    try {
      await userApi.deleteUserByAdmin(userId);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      setUserToDelete(null);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user.",
        variant: "destructive",
      });
    }
  };


  const getUserRole = (user: ApiUser): string => {
    return user.role;
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
                        disabled={isCreatingAdmin}
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
                        disabled={isCreatingAdmin}
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
                        disabled={isCreatingAdmin}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateAdmin} 
                    className="w-full md:w-auto"
                    disabled={isCreatingAdmin}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isCreatingAdmin ? 'Creating...' : 'Create Admin Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={roleFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRoleFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={roleFilter === 'admin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRoleFilter('admin')}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admins
                    </Button>
                    <Button
                      variant={roleFilter === 'user' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRoleFilter('user')}
                    >
                      Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Registered Users ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || roleFilter !== 'all' 
                        ? 'Try adjusting your search or filters.'
                        : 'No users registered yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
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
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                            {getUserRole(user)}
                          </Badge>
                          {user.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteUser(user._id)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserToDelete(user._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
