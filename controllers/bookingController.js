//https://dashboard.stripe.com/test/workbench/logs?selected=req_GmhGMytlZZeqyw

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Adventure = require('../models/adventureModel');
//const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
//const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked adventure
  const adventure = await Adventure.findById(req.params.adventureId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?adventure=${
      req.params.adventureId
    }&user=${req.user.id}&price=${adventure.price}`,
    // Soon as purchase was successful the user will be redirected to this URL
    // success_url: `${req.protocol}://${req.get('host')}/`,
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
              `https://natours.dev/img/adventures/${adventure.imageCover}`,
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

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { adventure, user, price } = req.query;

  if (!adventure && !user && !price) return next();
  await Booking.create({ adventure, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// const createBookingCheckout = async (session) => {
//   const adventure = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email })).id;
//   const price = session.display_items[0].amount / 100;
//   await Booking.create({ adventure, user, price });
// };

// exports.webhookCheckout = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET,
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed')
//     createBookingCheckout(event.data.object);

//   res.status(200).json({ received: true });
// };

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
