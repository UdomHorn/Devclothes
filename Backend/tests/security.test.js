const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { User, Order, Banner } = require('../src/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Increase default timeout for slow database tests
jest.setTimeout(30000);

describe('Security Protections Integration Tests', () => {
  let adminUser, regularUserA, regularUserB;
  let adminToken, userAToken, userBToken;
  let registeredOrderA, guestOrder;

  beforeAll(async () => {
    await sequelize.sync();

    // Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    adminUser = await User.create({
      email: 'admin_security_test@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    regularUserA = await User.create({
      email: 'usera_security_test@example.com',
      password: hashedPassword,
      role: 'user',
    });

    regularUserB = await User.create({
      email: 'userb_security_test@example.com',
      password: hashedPassword,
      role: 'user',
    });

    // Generate JWT tokens
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test_jwt_secret',
      { expiresIn: '1h' }
    );

    userAToken = jwt.sign(
      { id: regularUserA.id, email: regularUserA.email, role: regularUserA.role },
      process.env.JWT_SECRET || 'test_jwt_secret',
      { expiresIn: '1h' }
    );

    userBToken = jwt.sign(
      { id: regularUserB.id, email: regularUserB.email, role: regularUserB.role },
      process.env.JWT_SECRET || 'test_jwt_secret',
      { expiresIn: '1h' }
    );

    // Create a registered order belonging to User A
    registeredOrderA = await Order.create({
      userId: regularUserA.id,
      stripePaymentIntentId: 'pi_test_user_a_123',
      status: 'PAID',
      totalAmount: 99.99,
      shippingAddress: '123 Test St, Test City',
      customerEmail: regularUserA.email,
    });

    // Create a guest order (no userId)
    guestOrder = await Order.create({
      userId: null,
      stripePaymentIntentId: 'pi_test_guest_123',
      status: 'PAID',
      totalAmount: 49.99,
      shippingAddress: '456 Guest Ave, Guest Town',
      customerEmail: 'guest_test@example.com',
    });
  }, 30000);

  afterAll(async () => {
    // Cleanup records
    await Order.destroy({ where: { stripePaymentIntentId: ['pi_test_user_a_123', 'pi_test_guest_123'] } });
    await User.destroy({
      where: {
        email: [
          'admin_security_test@example.com',
          'usera_security_test@example.com',
          'userb_security_test@example.com',
        ],
      },
    });
    await sequelize.close();
  }, 30000);

  describe('Banner Routes Access Control', () => {
    it('should reject banner creation (POST /api/banners) when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/banners')
        .send({ title: 'Test Banner' });
      expect(res.status).toBe(401);
    });

    it('should reject banner creation (POST /api/banners) for standard users', async () => {
      const res = await request(app)
        .post('/api/banners')
        .set('Cookie', [`authToken=${userAToken}`])
        .send({ title: 'Test Banner' });
      expect(res.status).toBe(403);
    });

    it('should reject banner deletion (DELETE /api/banners/:id) when unauthenticated', async () => {
      const res = await request(app).delete('/api/banners/999');
      expect(res.status).toBe(401);
    });

    it('should reject banner deletion (DELETE /api/banners/:id) for standard users', async () => {
      const res = await request(app)
        .delete('/api/banners/999')
        .set('Cookie', [`authToken=${userAToken}`]);
      expect(res.status).toBe(403);
    });

    it('should reject category banner creation when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/banners/categories')
        .send({ category: 'Men' });
      expect(res.status).toBe(401);
    });

    it('should reject category banner creation for standard users', async () => {
      const res = await request(app)
        .post('/api/banners/categories')
        .set('Cookie', [`authToken=${userAToken}`])
        .send({ category: 'Men' });
      expect(res.status).toBe(403);
    });

    it('should reject category banner deletion when unauthenticated', async () => {
      const res = await request(app).delete('/api/banners/categories/Men');
      expect(res.status).toBe(401);
    });

    it('should reject category banner deletion for standard users', async () => {
      const res = await request(app)
        .delete('/api/banners/categories/Men')
        .set('Cookie', [`authToken=${userAToken}`]);
      expect(res.status).toBe(403);
    });
  });

  describe('Order Receipts IDOR Prevention', () => {
    // 1. Registered user A's order receipt
    it('should deny access to registered User A\'s order when requested with no token', async () => {
      const res = await request(app).get(`/api/payment/order/${registeredOrderA.id}`);
      expect(res.status).toBe(403);
    });

    it('should deny access to registered User A\'s order when requested by User B', async () => {
      const res = await request(app)
        .get(`/api/payment/order/${registeredOrderA.id}`)
        .set('Cookie', [`authToken=${userBToken}`]);
      expect(res.status).toBe(403);
    });

    it('should deny access to registered User A\'s order using email query matching', async () => {
      const res = await request(app)
        .get(`/api/payment/order/${registeredOrderA.id}?email=${regularUserA.email}`);
      expect(res.status).toBe(403);
    });

    it('should allow access to registered User A\'s order when requested by User A', async () => {
      const res = await request(app)
        .get(`/api/payment/order/${registeredOrderA.id}`)
        .set('Cookie', [`authToken=${userAToken}`]);
      expect(res.status).toBe(200);
      expect(res.body.customerEmail).toBe(regularUserA.email);
    });

    // 2. Guest order receipts
    it('should deny access to guest order when requested with no parameters', async () => {
      const res = await request(app).get(`/api/payment/order/${guestOrder.id}`);
      expect(res.status).toBe(403);
    });

    it('should deny access to guest order when requested with mismatching email query', async () => {
      const res = await request(app)
        .get(`/api/payment/order/${guestOrder.id}?email=mismatching@example.com`);
      expect(res.status).toBe(403);
    });

    it('should allow access to guest order when requested with matching email query', async () => {
      const res = await request(app)
        .get(`/api/payment/order/${guestOrder.id}?email=guest_test@example.com`);
      expect(res.status).toBe(200);
      expect(res.body.customerEmail).toBe('guest_test@example.com');
    });
  });
});
