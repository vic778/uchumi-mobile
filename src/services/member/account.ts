import { api } from '../api';
import type { Account, Transaction, Notification } from '@/types';

export async function getAccount(): Promise<Account> {
  const res = await api.get<{ data: Account }>('/member/account');
  return res.data.data;
}

export async function getAccounts(): Promise<Account[]> {
  const res = await api.get<{ data: Account[] }>('/member/accounts');
  return res.data.data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await api.get<{ data: Transaction[] }>('/member/transactions');
  return res.data.data;
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<{ data: Notification[] }>('/member/notifications');
  return res.data.data;
}
