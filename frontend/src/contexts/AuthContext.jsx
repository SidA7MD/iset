// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

// Export the context so it can be imported if needed
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');

    const loadAuthState = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        console.log('🔍 Stored token:', storedToken ? 'Found' : 'Not found');
        console.log('🔍 Stored user:', storedUser ? 'Found' : 'Not found');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ Auth state loaded from localStorage');
        } else {
          console.log('⚠️ No auth state found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error loading auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    loadAuthState();
  }, []);

  const login = async (credentials) => {
    console.log('🔐 Login called with:', credentials);

    try {
      // Import your auth API
      const { authApi } = await import('../api/authApi');

      // Call login API
      const response = await authApi.login(credentials);

      console.log('📥 API Response:', response);

      // Extract token and user from response.data
      // Backend returns: { success, message, data: { user, accessToken } }
      const token = response.data?.accessToken;
      const userData = response.data?.user;

      if (!token) {
        console.error('❌ No token in response:', response);
        throw new Error('No token received from server');
      }

      if (!userData) {
        console.error('❌ No user data in response:', response);
        throw new Error('No user data received from server');
      }

      // Ensure userData has required fields
      const user = {
        _id: userData._id || userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        assignedDevices: userData.assignedDevices || [],
      };

      console.log('💾 Saving to localStorage:', { token: '***', user });

      // Save to localStorage (use 'accessToken' to match backend)
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      console.log('✅ Login successful');

      // Return user data for the component
      return user;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔐 Logout called');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Logout successful');
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  // Don't render children until auth state is loaded
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading authentication...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
