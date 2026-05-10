import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { AuthUser } from '@/types';

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'REVIEWER' | 'COMPANY_OWNER' | 'ADMIN' | null;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) return null;
    const u = session.user as Record<string, unknown>;
    return {
      id: u.id as string,
      name: u.name as string | null,
      email: u.email as string | null,
      image: u.image as string | null,
      role: u.role as AuthUser['role'],
      phoneNumber: u.phoneNumber as string,
    };
  }, [session]);

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: user?.role ?? null,
  };
}
