import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user credentials (would use AsyncStorage in a real app)
    // For demo purposes, we'll just leave the user logged out
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API login - in a real app, this would call a real API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simple validation for demo
        if (email && password) {
          const userData = {
            id: 'user-123',
            name: 'John Doe',
            email: email,
          };
          setUser(userData);
          setIsAuthenticated(true);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    // Simulate API signup - in a real app, this would call a real API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          // In a real app, we would create a user account here
          resolve();
        } else {
          reject(new Error('Invalid signup data'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};