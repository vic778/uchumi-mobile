export type SavingsPlan = {
  id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  amount: number;
  status: string;
};

export type Account = {
  id: number;
  balance: number;
  savings_plan: SavingsPlan | null;
  status: string;
  member_since: string;
};

export type Transaction = {
  id: number;
  kind: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_payment';
  amount: number;
  created_at: string;
  note?: string;
};

export type Loan = {
  id: number;
  reference: string;
  amount: number;
  amount_paid: number;
  remaining: number;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'paid';
  months: number;
  created_at: string;
  agreed_at?: string;
};

export type Withdrawal = {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type Document = {
  id: number;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  front_url?: string;
  back_url?: string;
  selfie_url?: string;
};

export type Notification = {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};
