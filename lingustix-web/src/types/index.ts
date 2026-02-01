// API Response Types
export interface LoginResponse {
  token: string;
  expirationDate: string; // ISO 8601 date string from LocalDateTime
}

export interface AccountResponse {
  id: string; // UUID
  username: string;
  email: string;
}

export interface CompositionResponse {
  id: string; // UUID
  title: string;
  content: string;
  ownerId: string; // UUID
}

export interface Correction {
  original: string;
  suggested: string;
  startOffset: number;
  length: number;
  explanation: string;
}

export interface CompositionIndex {
  id: string;
  title: string;
  content: string;
  ownerId: string; // UUID
}

export interface CompositionVersionDTO {
  commitId: string;
  timestamp: string; // ISO 8601 date string from LocalDateTime
  author: string;
  title: string;
  content: string;
}

// API Request Types
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AccountCreateRequest {
  username: string;
  email: string;
  password: string;
}

export interface AccountUpdateEmailRequest {
  email: string;
}

export interface AccountUpdatePasswordRequest {
  password: string;
}

export interface AccountUpdateUsernameRequest {
  username: string;
}

export interface CompositionCreateRequest {
  title: string;
}

export interface CompositionUpdateContentRequest {
  content: string;
}

export interface CompositionUpdateTitleRequest {
  title: string;
}

export interface EvaluationCreateRequest {
  compositionId: string; // UUID
}

// Pagination Types
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Error Response Type
export interface ApiError {
  status: number;
  error: string;
  message?: string;
  resource?: string;
}

// Auth State Types
export interface AuthState {
  token: string | null;
  expirationDate: Date | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountResponse | null;
}

// Editor State Types
export interface EditorState {
  content: string;
  corrections: Correction[];
  isSaving: boolean;
  lastSaved: Date | null;
  wordCount: number;
  characterCount: number;
  readingTime: number;
  errorDensity: number;
}

// Settings State Types
export interface SettingsState {
  theme: 'dark' | 'light';
  autoSaveInterval: number;
  showOnboarding: boolean;
}
