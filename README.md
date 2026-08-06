# Devclothes E-Commerce Store

Devclothes is a modern, fully-featured e-commerce clothing store built using a React (Vite) frontend and a Node.js (Express) backend. It features robust Stripe integration for secure payments, PostgreSQL database storage, Google OAuth2 login, Cloudinary file uploads, and Telegram admin notifications.

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Router DOM, FontAwesome.
* **Backend:** Node.js, Express, PostgreSQL, Sequelize ORM.
* **Integrations:**
  * **Stripe:** Payment Intent creation, checkout elements, webhook verification, and automatic stock deduction.
  * **OAuth:** Google Sign-In support.
  * **Storage:** Cloudinary storage for product images.
  * **Notifications:** Telegram Bot notifications for new orders.

---

## Directory Structure

```text
├── Backend/                 # Express API server
│   ├── src/                 # Application source code
│   │   ├── config/          # Configurations (Database, Cloudinary)
│   │   ├── middleware/      # Auth and Admin middlewares
│   │   ├── models/          # Sequelize models (User, Product, Order, etc.)
│   │   ├── routes/          # Express route handlers
│   │   └── utils/           # Utility functions (Telegram, email)
│   └── tests/               # Backend Jest integration tests
├── Frontend/                # React/Vite Client
│   ├── public/              # Static public assets
│   └── src/                 # Components, Pages, and Contexts
└── tests/                   # Playwright E2E integration browser tests
```

---

## Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **PostgreSQL** database (local or cloud-hosted instance like Neon)
* **Stripe** developer sandbox account
* **Cloudinary** free media account
* **Google Cloud Console** OAuth project

---

### Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Backend` directory and define the following variables:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>?sslmode=require
   JWT_SECRET=your_jwt_signing_secret_key
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signature_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

   # Notifications & Messaging (Telegram Bot / Resend API)
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_channel_or_chat_id
   RESEND_API_KEY=re_your_resend_api_key
   ```

4. **Seed the Database:**
   Run the seed script to import products from pages and upload images to Cloudinary:
   ```bash
   npm run seed
   ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

---

### Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## Running Tests

### Backend Integration Tests
Jest integration tests verify authentication routing, access control, and user endpoint security.
* Run inside the `Backend` folder:
  ```bash
  npm run test
  ```

### End-to-End (E2E) Browser Tests
Playwright tests verify user registration, login, catalog checkout, and page redirect authorization flows.
* Run in the **root** folder:
  ```bash
  npx playwright test
  ```
