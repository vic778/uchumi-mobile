import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const STORE_KEY = 'app_lock_enabled';

type Ctx = {
  enabled:  boolean;
  locked:   boolean;
  loading:  boolean;
  toggle:   (value: boolean) => Promise<boolean>;
  unlock:   () => Promise<boolean>;
};

const AppLockContext = createContext<Ctx>({
  enabled: false, locked: false, loading: true,
  toggle: async () => false,
  unlock: async () => false,
});

export const useAppLock = () => useContext(AppLockContext);

async function authenticate(promptMessage = 'Déverrouillez Uchumi') {
  const hasHw      = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHw || !isEnrolled) {
    Alert.alert(
      'Sécurité non configurée',
      "Veuillez d'abord configurer un verrouillage (empreinte, Face ID ou code PIN) dans les paramètres de votre téléphone.",
    );
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Utiliser le code PIN',
    disableDeviceFallback: false,
    cancelLabel: 'Annuler',
  });
  return result.success;
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked]   = useState(false);
  const [loading, setLoading] = useState(true);
  const enabledRef = useRef(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then(v => {
      const on = v === 'true';
      setEnabled(on);
      enabledRef.current = on;
      if (on) setLocked(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'background' && enabledRef.current) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  const toggle = useCallback(async (value: boolean) => {
    if (value) {
      const ok = await authenticate('Confirmer pour activer la sécurité');
      if (!ok) return false;
    }
    await SecureStore.setItemAsync(STORE_KEY, String(value));
    setEnabled(value);
    enabledRef.current = value;
    if (!value) setLocked(false);
    return true;
  }, []);

  const unlock = useCallback(async () => {
    const ok = await authenticate();
    if (ok) setLocked(false);
    return ok;
  }, []);

  return (
    <AppLockContext.Provider value={{ enabled, locked, loading, toggle, unlock }}>
      {children}
    </AppLockContext.Provider>
  );
}
