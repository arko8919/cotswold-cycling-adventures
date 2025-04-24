import axios, { AxiosRequestConfig, Method } from 'axios';
import { showAlert } from '../alerts';
import getErrorMessage from '@js/utils/errorHandler';

interface ApiRequestOptions {
  method: Method;
  url: string;
  data?: any;
  successMsg?: string;
  errMsg?: string;
}

export const apiRequest = async ({
  method,
  url,
  data,
  successMsg = 'Action performed successfully.',
  errMsg,
}: ApiRequestOptions): Promise<any> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
    };

    const res = await axios(config);

    if (res.data.status !== 'success') {
      throw new Error('Invalid response from API.');
    }

    if (successMsg) {
      showAlert({ type: 'success', message: successMsg });
    }

    return res.data;
  } catch (error: unknown) {
    // Get error message
    const message = getErrorMessage(error, errMsg);

    // Show modal with error message
    if (errMsg) {
      showAlert({ type: 'error', message });
    }

    throw new Error(message);
  }
};
