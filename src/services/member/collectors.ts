import { api } from '../api';

export interface CollectorResult {
  id: number;
  full_name: string;
  phone_number: string;
}

export async function searchCollectors(q: string): Promise<CollectorResult[]> {
  const res = await api.get<{ data: CollectorResult[] }>('/member/collectors', { params: { q } });
  return res.data.data;
}
