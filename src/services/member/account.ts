import { api } from '../api';
import type { Account, BlockedAccountTransaction, Transaction, Notification } from '@/types';

export async function getAccount(): Promise<Account> {
  const res = await api.get<{ data: Account }>('/member/account');
  return res.data.data;
}

export async function getAccounts(): Promise<Account[]> {
  const res = await api.get<{ data: Account[] }>('/member/accounts');
  return res.data.data;
}

export async function getBlockedAccountTransactions(blockedAccountId: number): Promise<BlockedAccountTransaction[]> {
  const res = await api.get<{ data: BlockedAccountTransaction[] }>(
    `/member/blocked_accounts/${blockedAccountId}/transactions`
  );
  return res.data.data;
}

export async function getTransactions(params?: { kind?: string; period?: string }): Promise<Transaction[]> {
  const res = await api.get<{ data: Transaction[] }>('/member/transactions', { params });
  return res.data.data;
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<{ data: Notification[] }>('/member/notifications');
  return res.data.data;
}
