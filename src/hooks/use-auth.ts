import { useCallback, useEffect, useState } from 'react';
import { getToken, getMe, saveToken, logout as doLogout } from '@/services/auth';
import type { AuthUser } from '@/types';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AuthUser };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) { setState({ status: 'unauthenticated' }); return; }
      try {
        const user = await getMe();
        setState({ status: 'authenticated', user });
      } catch {
        setState({ status: 'unauthenticated' });
      }
    })();
  }, []);

  const signIn = useCallback(async (token: string) => {
    await saveToken(token);
    const user = await getMe();
    setState({ status: 'authenticated', user });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await doLogout();
    setState({ status: 'unauthenticated' });
  }, []);

  return { state, signIn, signOut };
}
