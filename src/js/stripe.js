/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51QuM1LP1ItbjeRQKqk8GOG7jhbz5fhLHQFimTlVb34s0fRa0wIBPcfqNgnk9MDqpi8e6SADvLHWgAtBTndaoMBbs00HoJpKfwx',
);

export const bookAdventure = async (adventureId) => {
  try {
    // 1) Get checkout session from endpoint ( API )
    const session = await axios(
      `/api/v1/bookings/checkout-session/${adventureId}`,
    );
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
