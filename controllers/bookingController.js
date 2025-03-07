//https://dashboard.stripe.com/test/workbench/logs?selected=req_GmhGMytlZZeqyw

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Adventure = require('../models/adventureModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked adventure
  const adventure = await Adventure.findById(req.params.adventureId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // Soon as purchase was successful the user will be redirected to this URL
    success_url: `${req.protocol}://${req.get('host')}/my-adventures?alert=booking`,
    // Page the user goes if they choose to cancel the current payment
    cancel_url: `${req.protocol}://${req.get('host')}/adventure/${adventure.slug}`,
    // User is already at the request as this is protected route
    customer_email: req.user.email,
    // Pass data about session we currently creating.
    // One purchase was successful we will get access to the session object again,
    // and by then we want to create new booking in our database
    // ( only work  with deployed website )
    client_reference_id: req.params.adventureId,
    // Details about product itself ( adventure )
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${adventure.name} Adventure`,
            description: adventure.summary,
            images: [
              `${req.protocol}://${req.get('host')}/assets/adventures/${adventure.imageCover}`,
            ],
          },
          unit_amount: adventure.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 3) Crated session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// Creates a new booking in the database after a successful Stripe checkout session.
const createBookingCheckout = async (session) => {
  // Extracts the adventure ID from the session's client reference ID.
  const adventure = session.client_reference_id;
  // Finds the user based on their email from the session data and retrieves their ID.
  const user = (await User.findOne({ email: session.customer_email })).id;
  // Extracts the booking price from the session (converting cents to the standard currency format).
  const price = session.amount_total / 100;

  // Saves the new booking record in the database.
  await Booking.create({ adventure, user, price });
};

// Handles Stripe webhook events to process successful checkout sessions.
exports.webhookCheckout = (req, res, next) => {
  //Extracts the Stripe signature from request headers.
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    // Verifies the event using Stripe's webhook secret to ensure authenticity.
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // If verification fails, returns a 400 error response.
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // If the event type is 'checkout.session.completed', triggers the booking creation process.
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  // Sends a 200 response to acknowledge receipt of the event.
  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
