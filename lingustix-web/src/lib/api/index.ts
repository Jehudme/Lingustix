import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  AccountCreateRequest,
  AccountResponse,
  AccountUpdateEmailRequest,
  AccountUpdatePasswordRequest,
  AccountUpdateUsernameRequest,
  CompositionCreateRequest,
  CompositionResponse,
  CompositionUpdateContentRequest,
  CompositionUpdateTitleRequest,
  EvaluationCreateRequest,
  Correction,
  CompositionIndex,
  Page,
} from '@/types';

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh');
    return response.data;
  },
};

// Account API
export const accountApi = {
  create: async (data: AccountCreateRequest): Promise<AccountResponse> => {
    const response = await apiClient.post<AccountResponse>('/accounts', data);
    return response.data;
  },

  getMe: async (): Promise<AccountResponse> => {
    const response = await apiClient.get<AccountResponse>('/accounts/me');
    return response.data;
  },

  updateEmail: async (data: AccountUpdateEmailRequest): Promise<AccountResponse> => {
    const response = await apiClient.patch<AccountResponse>('/accounts/email', data);
    return response.data;
  },

  updatePassword: async (data: AccountUpdatePasswordRequest): Promise<AccountResponse> => {
    const response = await apiClient.patch<AccountResponse>('/accounts/password', data);
    return response.data;
  },

  updateUsername: async (data: AccountUpdateUsernameRequest): Promise<AccountResponse> => {
    const response = await apiClient.patch<AccountResponse>('/accounts/username', data);
    return response.data;
  },

  delete: async (): Promise<void> => {
    await apiClient.delete('/accounts');
  },
};

// Composition API
export const compositionApi = {
  create: async (data: CompositionCreateRequest): Promise<CompositionResponse> => {
    const response = await apiClient.post<CompositionResponse>('/compositions', data);
    return response.data;
  },

  getById: async (id: string): Promise<CompositionResponse> => {
    const response = await apiClient.get<CompositionResponse>(`/compositions/${id}`);
    return response.data;
  },

  getIds: async (page = 0, size = 20): Promise<Page<string>> => {
    const response = await apiClient.get<Page<string>>('/compositions/ids', {
      params: { page, size },
    });
    return response.data;
  },

  updateTitle: async (id: string, data: CompositionUpdateTitleRequest): Promise<CompositionResponse> => {
    const response = await apiClient.patch<CompositionResponse>(`/compositions/${id}/title`, data);
    return response.data;
  },

  updateContent: async (id: string, data: CompositionUpdateContentRequest): Promise<CompositionResponse> => {
    const response = await apiClient.patch<CompositionResponse>(`/compositions/${id}/content`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/compositions/${id}`);
  },
};

// Evaluation API
export const evaluationApi = {
  create: async (data: EvaluationCreateRequest, signal?: AbortSignal): Promise<Correction[]> => {
    const response = await apiClient.post<Correction[]>('/evaluations', data, { signal });
    return response.data;
  },
};

// Search API
export const searchApi = {
  searchCompositions: async (
    query: string,
    page = 0,
    size = 20
  ): Promise<Page<CompositionIndex>> => {
    const response = await apiClient.get<Page<CompositionIndex>>('/search/compositions', {
      params: { query, page, size },
    });
    return response.data;
  },
};
