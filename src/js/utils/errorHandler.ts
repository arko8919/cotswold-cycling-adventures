import axios from 'axios';

/**
 * Retrieves a user-friendly error message from various error types.
 *
 * @param error - The error to extract the message from.
 * @param customMsg - Optional custom message.
 * @returns - Error message.
 */
const getErrorMessage = (error: unknown, customMsg?: string): string => {
  // Default fallback message.
  const fallbackMessage = 'Something went wrong!';

  if (process.env.NODE_ENV === 'development') {
    console.error(`Error details: ${customMsg || fallbackMessage}`, error);
  }

  if (customMsg) {
    return customMsg;
  }

  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    return typeof msg === 'string' ? msg : fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export default getErrorMessage;
