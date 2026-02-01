import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export type ErrorContext = 'login' | 'register' | 'default';

interface ErrorMessageMap {
  [key: number]: string;
}

const loginErrorMessages: ErrorMessageMap = {
  400: 'Invalid username or password. Please check your credentials.',
  401: 'Invalid credentials. Please try again.',
  403: 'Access denied. Your account may be suspended.',
  404: 'Account not found. Please check your username or email.',
  429: 'Too many login attempts. Please try again later.',
  500: 'Server is temporarily unavailable. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Server is temporarily unavailable. Please try again later.',
};

const registerErrorMessages: ErrorMessageMap = {
  400: 'Invalid registration data. Please check your information.',
  409: 'An account with this email or username already exists.',
  422: 'Please check your information and try again.',
  429: 'Too many registration attempts. Please try again later.',
  500: 'Server is temporarily unavailable. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Server is temporarily unavailable. Please try again later.',
};

const defaultErrorMessages: ErrorMessageMap = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication required. Please sign in.',
  403: 'Access denied.',
  404: 'Resource not found.',
  429: 'Too many requests. Please try again later.',
  500: 'Server is temporarily unavailable. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again later.',
  503: 'Server is temporarily unavailable. Please try again later.',
};

const contextMessages: Record<ErrorContext, ErrorMessageMap> = {
  login: loginErrorMessages,
  register: registerErrorMessages,
  default: defaultErrorMessages,
};

const defaultFallbackMessages: Record<ErrorContext, string> = {
  login: 'Login failed. Please try again.',
  register: 'Registration failed. Please try again.',
  default: 'An error occurred. Please try again.',
};

/**
 * Formats API error messages into user-friendly messages based on context.
 * Handles specific HTTP status codes and provides context-appropriate messages.
 */
function formatApiMessage(message: string, context: ErrorContext): string {
  if (context === 'register') {
    // Handle conflict messages for registration
    if (message.toLowerCase().includes('email already in use')) {
      return 'This email address is already registered. Please use a different email or sign in.';
    }
    if (message.toLowerCase().includes('username already in use')) {
      return 'This username is already taken. Please choose a different username.';
    }
  }
  return message;
}

/**
 * Extracts a user-friendly error message from an error object.
 * Handles AxiosError with API responses, network errors, and timeouts.
 * 
 * @param error - The error object to extract the message from
 * @param context - The context in which the error occurred (login, register, default)
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, context: ErrorContext = 'default'): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    const status = error.response?.status;

    // Handle specific error messages from the API
    if (apiError?.message) {
      return formatApiMessage(apiError.message, context);
    }

    // Handle HTTP status codes with context-appropriate messages
    if (status) {
      const errorMessages = contextMessages[context];
      if (status in errorMessages) {
        return errorMessages[status];
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
  }

  return defaultFallbackMessages[context];
}
