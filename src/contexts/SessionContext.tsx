import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Session {
  user?: User | null;
  expires?: string;
}

interface SessionContextType {
  session: Session | null;
  signIn: () => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
  }, []);

  const signIn = () => {
    // Simple sign in - in a real app, this would redirect to a login page
    const user: User = {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null,
    };
    const newSession: Session = { user };
    setSession(newSession);
    localStorage.setItem('session', JSON.stringify(newSession));
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem('session');
  };

  return (
    <SessionContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context.session;
}

export function useSessionActions() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionActions must be used within a SessionProvider');
  }
  return { signIn: context.signIn, signOut: context.signOut };
}