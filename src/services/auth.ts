import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import type { AuthUser, LoginResponse } from '@/types';

export async function login(phone_number: string, password: string): Promise<LoginResponse> {
  const res = await api.post<{ data: LoginResponse }>('/auth/login', { phone_number, password });
  return res.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ data: AuthUser }>('/me');
  return res.data.data;
}

export async function logout(): Promise<void> {
  try { await api.delete('/auth/logout'); } catch {}
  await SecureStore.deleteItemAsync('auth_token');
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}
