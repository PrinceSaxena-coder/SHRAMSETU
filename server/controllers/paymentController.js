import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import {
  createPaymentNotification,
} from '../services/notificationService.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../services/paymentService.js';

function formatPaymentResponse(payment) {
  if (!payment) {
    return null;
  }

  return {
    id: String(payment._id),
    bookingId: String(payment.bookingId),
    customerId: String(payment.customerId),
    razorpayOrderId: payment.razorpayOrderId || null,
    razorpayPaymentId: payment.razorpayPaymentId || null,
    amount: Number(payment.amount || 0),
    status: payment.status,
    createdAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : null,
  };
}

export const createPaymentOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const { bookingId } = req.body || {};

    if (!bookingId) {
      const error = new Error('Booking ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.findById(bookingId).lean();

    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (String(booking.customerId) !== String(req.user.userId)) {
      const error = new Error('You are not authorized to pay for this booking.');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status === 'cancelled') {
      const error = new Error('Cancelled bookings cannot be paid for.');
      error.statusCode = 400;
      throw error;
    }

    const bookingAmount = Number(booking.amount);

    if (!Number.isFinite(bookingAmount) || bookingAmount <= 0) {
      const error = new Error('Booking amount is invalid or missing.');
      error.statusCode = 400;
      throw error;
    }

    const existingPayment = await Payment.findOne({ bookingId: booking._id }).lean();

    if (existingPayment && existingPayment.status === 'paid') {
      const error = new Error('This booking already has a successful payment.');
      error.statusCode = 409;
      throw error;
    }

    if (existingPayment && existingPayment.status === 'created' && existingPayment.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        reused: true,
        order: {
          id: existingPayment.razorpayOrderId,
          amount: Number(existingPayment.amount || bookingAmount) * 100,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID,
        },
        payment: formatPaymentResponse(existingPayment),
      });
    }

    const order = await createRazorpayOrder({
      amountInRupees: bookingAmount,
      receipt: `booking_${String(booking._id)}`,
      notes: {
        bookingId: String(booking._id),
        customerId: String(req.user.userId),
      },
    });

    const payload = {
      bookingId: booking._id,
      customerId: booking.customerId,
      amount: bookingAmount,
      razorpayOrderId: order.id,
      status: 'created',
    };

    let paymentRecord;

    if (existingPayment) {
      paymentRecord = await Payment.findByIdAndUpdate(
        existingPayment._id,
        payload,
        { new: true, runValidators: true }
      ).lean();
    } else {
      paymentRecord = await Payment.create(payload);
    }

    return res.status(201).json({
      success: true,
      reused: false,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
      payment: formatPaymentResponse(paymentRecord),
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const error = new Error('Razorpay order, payment, and signature are required.');
      error.statusCode = 400;
      throw error;
    }

    const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id }).lean();

    if (!paymentRecord) {
      const error = new Error('Payment order not found.');
      error.statusCode = 404;
      throw error;
    }

    const booking = await Booking.findById(paymentRecord.bookingId).lean();

    if (!booking) {
      const error = new Error('Booking not found for payment verification.');
      error.statusCode = 404;
      throw error;
    }

    if (String(booking.customerId) !== String(req.user.userId)) {
      const error = new Error('You are not authorized to verify this payment.');
      error.statusCode = 403;
      throw error;
    }

    if (paymentRecord.status === 'paid') {
      if (paymentRecord.razorpayPaymentId === razorpay_payment_id && paymentRecord.razorpayOrderId === razorpay_order_id) {
        return res.status(200).json({
          success: true,
          idempotent: true,
          payment: formatPaymentResponse(paymentRecord),
        });
      }

      const error = new Error('This payment has already been completed with a different payment ID.');
      error.statusCode = 409;
      throw error;
    }

    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      await Payment.findByIdAndUpdate(paymentRecord._id, { status: 'failed' }, { new: true });

      const error = new Error('Invalid Razorpay payment signature.');
      error.statusCode = 400;
      throw error;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentRecord._id,
      {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        amount: Number(paymentRecord.amount || booking.amount || 0),
      },
      { new: true, runValidators: true }
    ).lean();

    await createPaymentNotification({
      customerId: booking.customerId,
      bookingId: booking._id,
      paymentId: updatedPayment._id,
      title: 'Payment successful',
      message: 'Your payment has been successfully verified.',
    });

    return res.status(200).json({
      success: true,
      idempotent: false,
      payment: formatPaymentResponse(updatedPayment),
    });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;
    const payment = await Payment.findById(id).lean();

    if (!payment) {
      const error = new Error('Payment not found.');
      error.statusCode = 404;
      throw error;
    }

    const booking = await Booking.findById(payment.bookingId).lean();

    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (req.user.role !== 'admin' && String(booking.customerId) !== String(req.user.userId)) {
      const error = new Error('You are not authorized to access this payment.');
      error.statusCode = 403;
      throw error;
    }

    return res.status(200).json({
      success: true,
      payment: formatPaymentResponse(payment),
    });
  } catch (error) {
    return next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(200).json({
        success: true,
        message: 'Webhook not configured locally; skipping verification.',
      });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    if (!signature || !rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook payload or signature.',
      });
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay webhook signature.',
      });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const paymentEntity = event?.payload?.payment?.entity;

    if (!paymentEntity) {
      return res.status(200).json({
        success: true,
        message: 'Webhook event ignored.',
      });
    }

    const paymentRecord = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id }).lean();

    if (!paymentRecord) {
      return res.status(200).json({
        success: true,
        message: 'Webhook received for an unknown payment order.',
      });
    }

    if (paymentRecord.status === 'paid' && paymentRecord.razorpayPaymentId === paymentEntity.id) {
      return res.status(200).json({
        success: true,
        message: 'Duplicate webhook ignored.',
      });
    }

    await Payment.findByIdAndUpdate(
      paymentRecord._id,
      {
        status: 'paid',
        razorpayPaymentId: paymentEntity.id,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully.',
    });
  } catch (error) {
    return next(error);
  }
};
