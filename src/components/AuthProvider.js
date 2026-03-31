'use client';
import { SessionProvider } from 'next-auth/react';

// Wraps the app so client components can use useSession()
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
