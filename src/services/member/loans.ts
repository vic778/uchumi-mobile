import { api } from '../api';
import type { Loan } from '@/types';

export async function getLoans(): Promise<Loan[]> {
  const res = await api.get<{ data: Loan[] }>('/member/loans');
  return res.data.data;
}

export async function getLoan(id: number): Promise<Loan> {
  const res = await api.get<{ data: Loan }>(`/member/loans/${id}`);
  return res.data.data;
}

export async function applyLoan(amount: number, months: number): Promise<Loan> {
  const res = await api.post<{ data: Loan }>('/member/loans', { amount, months });
  return res.data.data;
}

export async function agreeLoan(id: number): Promise<Loan> {
  const res = await api.post<{ data: Loan }>(`/member/loans/${id}/agree`);
  return res.data.data;
}
