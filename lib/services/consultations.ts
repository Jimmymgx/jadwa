import { api } from '../api';
import { Consultation } from '../types';

export const consultationsService = {
  listMy: (token: string) => api.get<Consultation[]>('/consultations/my', token),

  book: (
    token: string,
    input: {
      consultantId?: string; // Optional for chat consultations
      type: 'video' | 'chat';
      scheduledAt?: string | null;
      durationMinutes?: number;
      price: number;
      notes?: string | null;
    }
  ) => api.post<{ consultation: Consultation; payment: any }>('/consultations/book', input, token),

  updateStatus: (
    token: string,
    id: string,
    payload: { status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'; meetingLink?: string | null }
  ) => api.put<Consultation>(`/consultations/${id}/status`, payload, token),
};


