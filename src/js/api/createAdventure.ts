import axios, { AxiosResponse } from 'axios';
import { showAlert } from '../alerts';
import getErrorMessage from '../utils/errorHandler';

/**
 * Creates or updates an adventure by sending a POST or PATCH request.
 *
 * @param data - FormData containing adventure details.
 * @param action - Action type: 'create' for new adventure, 'update' for existing adventure.
 * @param id - Adventure ID (required only for updating).
 *
 */
export const createAdventure = async (
  data: FormData,
  action: 'create' | 'update',
  id: string = '',
) => {
  try {
    let url = '/api/v1/adventures';
    let res: AxiosResponse<any>;

    switch (action) {
      case 'create':
        res = await axios.post(url, data);
        break;
      case 'update':
        res = await axios.patch(`${url}/${id}`, data);
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    if (res.data.status === 'success') {
      showAlert({
        type: 'success',
        message: `Adventure ${action}d successfully`,
      });
    }
  } catch (err) {
    const message = getErrorMessage(err, 'Adventure operation failed.');
    showAlert({ type: 'error', message });
  }
};
