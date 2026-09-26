import { api } from '../api';
import type { Withdrawal } from '@/types';

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const res = await api.get<{ data: Withdrawal[] }>('/member/withdrawals');
  return res.data.data;
}

export async function requestWithdrawal(amount: number): Promise<Withdrawal> {
  const res = await api.post<{ data: Withdrawal }>('/member/withdrawals', { amount });
  return res.data.data;
}
