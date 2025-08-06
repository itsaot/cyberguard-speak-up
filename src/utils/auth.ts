export const getAuthToken = (): string | null => {
  return localStorage.getItem('cyberguard_token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const hasRole = (user: any, requiredRole: 'user' | 'moderator' | 'admin'): boolean => {
  if (!user) return false;
  
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3,
  };
  
  const userRole = user.isAdmin ? 'admin' : (user.isModerator ? 'moderator' : 'user');
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};