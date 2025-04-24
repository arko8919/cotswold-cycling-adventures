import axios from 'axios';

export default function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
): string {
  if (process.env.NODE_ENV === 'development') {
    console.error(fallback, error);
  }

  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    return typeof msg === 'string' ? msg : fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
