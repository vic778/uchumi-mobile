import { api } from '../api';
import type { Withdrawal } from '@/types';

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const res = await api.get<{ data: Withdrawal[] }>('/member/withdrawals');
  return res.data.data;
}

export async function requestWithdrawal(params: { amount: number; collector_phone: string }): Promise<Withdrawal> {
  const res = await api.post<{ data: Withdrawal }>('/member/withdrawals', params);
  return res.data.data;
}
