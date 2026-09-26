import { api } from '../api';
import type { Document } from '@/types';

export async function getDocuments(): Promise<Document[]> {
  const res = await api.get<{ data: Document[] }>('/member/documents');
  return res.data.data;
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  const res = await api.post<{ data: Document }>('/member/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
