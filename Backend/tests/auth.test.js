const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

// Increase default timeout for this slow network database test
jest.setTimeout(30000);

const TEST_EMAIL = 'test_integration@example.com';
const TEST_PASSWORD = 'password123';

describe('Authentication API Endpoints', () => {
  let testUser;

  // 1. Setup: Sync DB and create a dummy user before running tests (30s limit)
  beforeAll(async () => {
    await sequelize.sync(); 
    
    // Hash password just like the backend does
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

    // Create the test user in the database
    testUser = await User.create({
      email: TEST_EMAIL,
      password: hashedPassword,
      role: 'user'
    });
  }, 30000);

  // 2. Cleanup: Delete the test user and close the database connection (30s limit)
  afterAll(async () => {
    if (testUser) {
      await User.destroy({ where: { email: TEST_EMAIL } });
    }
    await sequelize.close(); 
  }, 30000);

  // Test suite for Login
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(TEST_EMAIL);
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'wrong_password'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid email or password.');
    });
  });

  // Test suite for Profile fetching (/me)
  describe('GET /api/auth/me', () => {
    it('should deny access if no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Access denied. No token provided.');
    });

    it('should allow access and return profile if valid JWT is provided in headers', async () => {
      // First, log in to get a valid token set in cookies/headers
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });

      // Grab cookie from login response
      const cookie = loginRes.headers['set-cookie'];

      // Send GET /me request with the cookie attached
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie); // Attach the authToken cookie to the request

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(TEST_EMAIL);
      expect(res.body.role).toBe('user');
    });
  });
});
