import { api } from '@/services/api';

export interface CollectorDashboard {
  today_total: number;
  today_count: number;
  pending_withdrawals: number;
  approved_withdrawals: number;
  loans_to_disburse: number;
  recent_deposits: DashboardDeposit[];
}

export interface DashboardDeposit {
  id: number;
  reference: string;
  amount: number;
  member: string;
  created_at: string;
}

export interface CollectorMember {
  id: number;
  phone_number: string;
  full_name: string;
  initials: string;
  balance: number;
  status: string;
  recent_transactions?: CollectorTransaction[];
}

export interface CollectorTransaction {
  id: number;
  reference: string;
  kind: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface CollectorWithdrawal {
  id: number;
  reference: string;
  amount: number;
  status: string;
  member: string;
  phone: string;
  notes: string | null;
  created_at: string;
}

export interface CollectorLoan {
  id: number;
  reference: string;
  amount: number;
  outstanding_amount: number;
  status: string;
  member: string;
  phone: string;
  created_at: string;
}

export async function getDashboard(): Promise<CollectorDashboard> {
  const res = await api.get<{ data: CollectorDashboard }>('/collector/dashboard');
  return res.data.data;
}

export async function getMembers(): Promise<CollectorMember[]> {
  const res = await api.get<{ data: CollectorMember[] }>('/collector/members');
  return res.data.data;
}

export async function lookupMember(phone: string): Promise<CollectorMember> {
  const res = await api.get<{ data: CollectorMember }>(`/collector/members/lookup?phone_number=${encodeURIComponent(phone)}`);
  return res.data.data;
}

export async function getMember(phoneSlug: string): Promise<CollectorMember> {
  const res = await api.get<{ data: CollectorMember }>(`/collector/members/${encodeURIComponent(phoneSlug)}`);
  return res.data.data;
}

export async function createDeposit(params: { phone_number?: string; member_id?: number; amount: number; notes?: string }): Promise<DashboardDeposit> {
  const res = await api.post<{ data: DashboardDeposit }>('/collector/deposits', params);
  return res.data.data;
}

export async function getWithdrawals(): Promise<{ pending: CollectorWithdrawal[]; approved: CollectorWithdrawal[] }> {
  const res = await api.get<{ data: { pending: CollectorWithdrawal[]; approved: CollectorWithdrawal[] } }>('/collector/withdrawals');
  return res.data.data;
}

export async function disburseWithdrawal(id: number): Promise<CollectorWithdrawal> {
  const res = await api.post<{ data: CollectorWithdrawal }>(`/collector/withdrawals/${id}/disburse`, {});
  return res.data.data;
}

export async function getLoans(): Promise<{ to_disburse: CollectorLoan[]; active: CollectorLoan[] }> {
  const res = await api.get<{ data: { to_disburse: CollectorLoan[]; active: CollectorLoan[] } }>('/collector/loans');
  return res.data.data;
}

export async function repayLoan(ref: string, amount: number): Promise<CollectorLoan> {
  const res = await api.post<{ data: CollectorLoan }>(`/collector/loans/${encodeURIComponent(ref)}/repay`, { amount });
  return res.data.data;
}
