import { api } from '@/services/api';

export type AdminDashboard = {
  members_count: number;
  collectors_count: number;
  pending_withdrawals: number;
  pending_loans: number;
  total_savings: number;
  active_loans_count: number;
  total_outstanding: number;
  chart_labels: string[];
  chart_deposits: number[];
  chart_loans: number[];
  chart_ratio: number[];
  loan_statuses: Record<string, number>;
  recent_transactions: AdminTransaction[];
  recent_loans: AdminLoanSummary[];
};

export type AdminMember = {
  id: number;
  full_name: string;
  initials: string;
  phone_number: string;
  role: string;
  status: string;
  balance: number;
  active_loan: boolean;
  created_at: string;
};

export type AdminMemberDetail = AdminMember & {
  transactions: AdminTransaction[];
  loans: AdminLoanSummary[];
  documents: AdminDocument[];
};

export type AdminTransaction = {
  id: number;
  reference: string;
  kind: string;
  amount: number;
  status: string;
  member?: string;
  member_phone?: string;
  collector?: string;
  approved_by?: string;
  note?: string;
  created_at: string;
};

export type AdminLoanSummary = {
  id: number;
  reference: string;
  amount: number;
  status: string;
  created_at: string;
  member: { full_name: string; phone_number: string; initials: string };
};

export type AdminLoanDetail = AdminLoanSummary & {
  notes?: string;
  offer_notes?: string;
  disbursed_amount?: number;
  outstanding_amount: number;
  installments: { id: number; amount: number; due_date?: string; paid: boolean; paid_at?: string }[];
};

export type AdminWithdrawal = {
  id: number;
  reference: string;
  amount: number;
  status: string;
  notes?: string;
  member: { full_name: string; phone_number: string; initials: string };
  collector?: { full_name: string };
  approved_by?: { full_name: string };
  created_at: string;
};

export type AdminKYC = {
  id: number;
  document_type: string;
  label: string;
  status: string;
  notes?: string;
  has_front: boolean;
  has_back: boolean;
  has_selfie: boolean;
  member: { full_name: string; phone_number: string; initials: string };
  created_at: string;
  front_url?: string;
  back_url?: string;
  selfie_url?: string;
};

export type AdminDocument = {
  id: number;
  document_type: string;
  label: string;
  status: string;
  created_at: string;
};

export type SavingsPlan = {
  id: number;
  name: string;
  frequency: string;
  min_amount: number;
  max_loan_ratio: number;
  active: boolean;
  created_at: string;
};

export const getDashboard = async (): Promise<AdminDashboard> => {
  const r = await api.get('/admin/dashboard');
  return r.data.data;
};

export const getMembers = async (params?: { status?: string; sort?: string }): Promise<AdminMember[]> => {
  const r = await api.get('/admin/members', { params });
  return r.data.data;
};

export const getMember = async (phoneSlug: string): Promise<AdminMemberDetail> => {
  const r = await api.get(`/admin/members/${phoneSlug}`);
  return r.data.data;
};

export const suspendMember = async (phoneSlug: string): Promise<void> => {
  await api.patch(`/admin/members/${phoneSlug}/suspend`);
};

export const activateMember = async (phoneSlug: string): Promise<void> => {
  await api.patch(`/admin/members/${phoneSlug}/activate`);
};

export const promoteCollector = async (phoneSlug: string): Promise<void> => {
  await api.patch(`/admin/members/${phoneSlug}/promote_collector`);
};

export const demoteMember = async (phoneSlug: string): Promise<void> => {
  await api.patch(`/admin/members/${phoneSlug}/demote_member`);
};

export const getWithdrawals = async (): Promise<{ pending: AdminWithdrawal[]; recent: AdminWithdrawal[] }> => {
  const r = await api.get('/admin/withdrawals');
  return r.data.data;
};

export const approveWithdrawal = async (id: number): Promise<void> => {
  await api.post(`/admin/withdrawals/${id}/approve`);
};

export const rejectWithdrawal = async (id: number, notes?: string): Promise<void> => {
  await api.post(`/admin/withdrawals/${id}/reject`, { notes });
};

export const getLoans = async (params?: { status?: string }): Promise<AdminLoanSummary[]> => {
  const r = await api.get('/admin/loans', { params });
  return r.data.data;
};

export const getLoan = async (ref: string): Promise<AdminLoanDetail> => {
  const r = await api.get(`/admin/loans/${ref}`);
  return r.data.data;
};

export const approveLoan = async (ref: string): Promise<void> => {
  await api.post(`/admin/loans/${ref}/approve`);
};

export const fundLoan = async (ref: string): Promise<void> => {
  await api.post(`/admin/loans/${ref}/fund`);
};

export const rejectLoan = async (ref: string, notes?: string): Promise<void> => {
  await api.post(`/admin/loans/${ref}/reject`, { notes });
};

export const repayLoan = async (ref: string, amount: number): Promise<void> => {
  await api.post(`/admin/loans/${ref}/repay`, { amount });
};

export const getKyc = async (params?: { status?: string }): Promise<AdminKYC[]> => {
  const r = await api.get('/admin/kyc', { params });
  return r.data.data;
};

export const getKycDetail = async (id: number): Promise<AdminKYC> => {
  const r = await api.get(`/admin/kyc/${id}`);
  return r.data.data;
};

export const approveKyc = async (id: number): Promise<void> => {
  await api.post(`/admin/kyc/${id}/approve`);
};

export const rejectKyc = async (id: number, notes?: string): Promise<void> => {
  await api.post(`/admin/kyc/${id}/reject`, { notes });
};

export const getSavingsPlans = async (): Promise<SavingsPlan[]> => {
  const r = await api.get('/admin/savings_plans');
  return r.data.data;
};

export type AdminNotification = {
  id: number;
  kind: string;
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
};

export const getAdminTransactions = async (params?: { kind?: string; period?: string; type?: string }): Promise<AdminTransaction[]> => {
  const r = await api.get('/admin/transactions', { params });
  return r.data.data;
};

export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
  const r = await api.get('/admin/notifications');
  return r.data.data;
};
