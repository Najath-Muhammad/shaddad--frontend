import { Alert } from 'react-native';

export const parseApiError = (error: unknown, fallbackMessage = 'An unexpected error occurred.'): string => {
  // Check if it's our standard backend error response
    const errorData = (error as any)?.response?.data?.error;
  if (errorData?.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
    return errorData.details.map((d: any) => d.message).join('\n');
  }
  const apiMessage = errorData?.message;
  if (apiMessage) return apiMessage;
  
  // If it's a generic Axios or Network error, map to friendly text
  const errorMessage = (error as Error)?.message;
  
  if (errorMessage?.includes('Network Error') || errorMessage?.includes('timeout')) {
    return 'Server is warming up, please wait a moment and try again. (This can take up to 30 seconds on first launch)';
  }
  if (errorMessage?.includes('500')) {
    return 'Oops! Something went wrong on our end. Please try again later.';
  }
  
  return errorMessage || fallbackMessage;
};

export const showError = (error: unknown, title = 'Error', fallback?: string) => {
  Alert.alert(title, parseApiError(error, fallback));
};

export const showSuccess = (message: string, title = 'Success') => {
  Alert.alert(title, message);
};


