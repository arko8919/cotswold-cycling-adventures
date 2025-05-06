import axios from 'axios';
import { showAlert } from './alerts';
import getErrorMessage from './utils/errorHandler';
import { CheckoutSessionResponse } from '@js/types';

// Public key for stripe
const stripe = Stripe(
  'pk_test_51QuM1LP1ItbjeRQKqk8GOG7jhbz5fhLHQFimTlVb34s0fRa0wIBPcfqNgnk9MDqpi8e6SADvLHWgAtBTndaoMBbs00HoJpKfwx',
);

/**
 * Initiates Stripe Checkout for a given adventure
 * @param adventureId - The ID of the adventure to be booked
 */
const bookAdventure = async (adventureId: string): Promise<void> => {
  try {
    // Request a Stripe checkout session from the backend
    const res = await axios.get<CheckoutSessionResponse>(
      `/api/v1/bookings/checkout-session/${adventureId}`,
    );

    // Validate session response before proceeding
    if (res.data.status !== 'success' || !res.data.session.id) {
      throw new Error('Invalid response from booking API.');
    }

    // Redirect the user to Stripe's hosted checkout page
    const result = await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });

    // Handle client-side Stripe errors (e.g. popup blocked, network error)
    if (result.error) {
      const message = getErrorMessage(
        result.error,
        'Checkout failed. Please try again.',
      );
      showAlert({ type: 'error', message });
    }
  } catch (err: unknown) {
    const message = getErrorMessage(err, 'Booking failed.');
    showAlert({ type: 'error', message });
  }
};

export default bookAdventure;
