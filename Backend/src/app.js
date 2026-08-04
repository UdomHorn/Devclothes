const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem, Product, Notification } = require('./models');
const { sendTelegramNotification } = require('./utils/telegram');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Enforce JWT_SECRET environment validation on startup
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

const app = express();

const logToFile = (msg) => {
  const time = new Date().toISOString();
  try {
    fs.appendFileSync(path.join(__dirname, '../server.log'), `[${time}] ${msg}\n`);
  } catch (e) {
    console.error('Failed to write to server.log:', e);
  }
};

app.use((req, res, next) => {
  logToFile(`${req.method} ${req.url} - Content-Length: ${req.headers['content-length'] || 0} - IP: ${req.ip}`);
  next();
});

// Enable CORS with credentials support
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Cookie Parser Middleware
app.use(cookieParser());

// 1. Stripe Webhook - MUST run before express.json() to get raw buffer
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Stripe Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`💰 PaymentIntent for ${paymentIntent.amount} succeeded.`);

    try {
      const order = await Order.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (order) {
        if (order.status !== 'PAID') {
          await sequelize.transaction(async (t) => {
            order.status = 'PAID';
            await order.save({ transaction: t });

            await Notification.create({
              type: 'NEW_ORDER',
              title: 'New Order Received',
              message: `Order #${order.id} paid by ${order.customerEmail} for $${order.totalAmount.toFixed(2)}`,
              metadata: { orderId: order.id }
            }, { transaction: t });
          });
          console.log(`✅ Order #${order.id} status updated to PAID. Stock was already reserved at intent creation.`);
          sendTelegramNotification(order.id);
        }
      } else {
        console.warn(`⚠️ Order for payment intent ${paymentIntent.id} not found.`);
      }
    } catch (error) {
      console.error('❌ Error processing payment success webhook:', error);
      return res.status(500).json({ error: 'DB update error.' });
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    console.log(`❌ PaymentIntent for ${paymentIntent.id} failed.`);

    try {
      const order = await Order.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (order) {
        if (order.status !== 'FAILED') {
          await sequelize.transaction(async (t) => {
            order.status = 'FAILED';
            await order.save({ transaction: t });

            for (const item of order.items) {
              const product = await Product.findByPk(item.productId, { transaction: t });
              if (product) {
                if (product.sizeStock && item.selectedSize) {
                  const sizeStock = { ...product.sizeStock };
                  if (item.selectedColor && sizeStock[item.selectedColor]) {
                    const colorSizeStock = { ...sizeStock[item.selectedColor] };
                    const current = parseInt(colorSizeStock[item.selectedSize], 10) || 0;
                    colorSizeStock[item.selectedSize] = current + item.quantity;
                    sizeStock[item.selectedColor] = colorSizeStock;
                  } else if (sizeStock[item.selectedSize] !== undefined) {
                    const current = parseInt(sizeStock[item.selectedSize], 10) || 0;
                    sizeStock[item.selectedSize] = current + item.quantity;
                  }
                  product.sizeStock = sizeStock;
                }
                if (product.colorStock && item.selectedColor) {
                  const colorStock = { ...product.colorStock };
                  const current = parseInt(colorStock[item.selectedColor], 10) || 0;
                  colorStock[item.selectedColor] = current + item.quantity;
                  product.colorStock = colorStock;
                }
                await product.save({ transaction: t });
                console.log(`♻️ Restored ${item.quantity}x "${product.name}" (Size: ${item.selectedSize}, Color: ${item.selectedColor}) — payment failed.`);
              }
            }

            await Notification.create({
              type: 'PAYMENT_FAILED',
              title: 'Payment Failed',
              message: `Stripe payment failed for Order #${order.id} (customer: ${order.customerEmail})`,
              metadata: { orderId: order.id }
            }, { transaction: t });
          });
          console.log(`✅ Order #${order.id} status updated to FAILED and reserved stock restored.`);
        }
      } else {
        console.warn(`⚠️ Order for failed payment intent ${paymentIntent.id} not found.`);
      }
    } catch (error) {
      console.error('❌ Error processing payment failure webhook:', error);
      return res.status(500).json({ error: 'DB update error.' });
    }
  }

  res.json({ received: true });
});

// 2. Standard Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running.' });
});

// Register routes
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Server Error:', err);
  logToFile(`❌ ERROR: ${err.message}\nStack: ${err.stack}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
