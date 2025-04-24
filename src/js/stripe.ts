import axios from 'axios';
import { showAlert } from './alerts';
import getErrorMessage from './utils/errorHandler';
import { CheckoutSessionResponse } from '@js/types';

const stripe = Stripe(
  'pk_test_51QuM1LP1ItbjeRQKqk8GOG7jhbz5fhLHQFimTlVb34s0fRa0wIBPcfqNgnk9MDqpi8e6SADvLHWgAtBTndaoMBbs00HoJpKfwx',
);

/**
 * Initiates Stripe Checkout for a given adventure
 * @param adventureId - The ID of the adventure to be booked
 */
export const bookAdventure = async (adventureId: string): Promise<void> => {
  try {
    // Request a Stripe checkout session from the backend
    const response = await axios.get<CheckoutSessionResponse>(
      `/api/v1/bookings/checkout-session/${adventureId}`,
    );
    // Validate session response before proceeding
    if (response.data.status !== 'success' || !response.data.session?.id) {
      throw new Error('Invalid response from booking API.');
    }

    // Redirect the user to Stripe's hosted checkout page
    const result = await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });

    // Handle client-side Stripe errors (e.g. popup blocked, network error)
    if (result.error) {
      if (process.env.NODE_ENV === 'development' && result.error) {
        console.error('Stripe redirectToCheckout error:', result.error);
      }

      const message =
        result.error.message ?? 'Checkout failed. Please try again.';

      showAlert({ type: 'error', message });
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Booking failed.');
    showAlert({ type: 'error', message });
  }
};
