import { api } from '../api';
import { StudyRequest } from '../types';

export const studyRequestsService = {
  listMy: (token: string) => api.get<StudyRequest[]>('/study-requests/my', token),

  create: (
    token: string,
    input: {
      type: 'feasibility_study' | 'economic_analysis' | 'financial_report';
      title: string;
      description: string;
      details?: any;
      attachments?: any[];
    }
  ) => api.post<StudyRequest>('/study-requests', input, token),

  quote: (
    token: string,
    id: string,
    payload: { price: number; durationDays: number }
  ) => api.put<StudyRequest>(`/study-requests/${id}/quote`, payload, token),

  approve: (token: string, id: string) => api.put<StudyRequest>(`/study-requests/${id}/approve`, {}, token),

  complete: (
    token: string,
    id: string,
    payload: { deliverables?: any[] }
  ) => api.put<StudyRequest>(`/study-requests/${id}/complete`, payload, token),
};


