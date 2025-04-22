import axios, { AxiosError } from 'axios';
import { showAlert } from './alerts';
import { CheckoutSessionResponse } from '@js/types';

const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY!);

/**
 * Start Stripe checkout for a given adventure
 * @param adventureId - ID of the adventure being booked
 */
export const bookAdventure = async (adventureId: string): Promise<void> => {
  try {
    const response = await axios.get<CheckoutSessionResponse>(
      `/api/v1/bookings/checkout-session/${adventureId}`,
    );

    if (response.data.status !== 'success' || !response.data.session?.id) {
      throw new Error('Invalid response from booking API.');
    }

    const result = await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });

    if (result.error) {
      const message =
        result.error.message ?? 'Checkout failed. Please try again.';
      showAlert({ type: 'error', message });
    }
  } catch (error) {
    let message = 'An unexpected error occurred. Please try again.';

    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.message;
      if (typeof backendMessage === 'string') {
        message = backendMessage;
      }

      console.error('Axios error:', error.response || error.message);
    } else {
      console.error('Unknown error:', error);
    }

    showAlert({ type: 'error', message });
  }
};
