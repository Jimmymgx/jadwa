import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, from } from '../lib/database';
import { signUp as authSignUp, signIn as authSignIn, verifySession, getToken, setToken, removeToken } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  session: { token: string | null } | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'consultant') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = getToken();
    if (token) {
      verifySession(token).then(({ user, error }) => {
        if (user && !error) {
          setUser(user);
          setSession({ token });
        } else {
          removeToken();
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'client' | 'consultant') => {
    const { user, token, error } = await authSignUp(email, password, fullName, role);
    
    if (error) throw error;
    if (!user || !token) throw new Error('Failed to create user');

    setToken(token);
    setUser(user);
    setSession({ token });
  };

  const signIn = async (email: string, password: string) => {
    const { user, token, error } = await authSignIn(email, password);
    
    if (error) throw error;
    if (!user || !token) throw new Error('Invalid credentials');

    setToken(token);
    setUser(user);
    setSession({ token });
  };

  const signOut = async () => {
    removeToken();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const { error } = await from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
