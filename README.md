# AgroFresh

AgroFresh is a modular agro marketplace platform that merges direct farm-to-customer commerce with business procurement, delivery coordination, admin operations, and a Socket.io negotiation layer. The codebase is structured so B2C, B2B, logistics, monetization, and future AI services can evolve without rewriting the core system.

## Stack

- Frontend: React 19, Vite, React Router v6, Axios, TailwindCSS, Socket.io client
- Backend: Node.js, Express, Mongoose, JWT httpOnly cookies, Cloudinary, Socket.io
- Database: MongoDB Atlas
- Deployment: Vercel for `client`, Render for `server`

## Project Structure

```text
/agrofresh
├── client
├── server
└── README.md
```

## Roles

- Farmer
- Customer
- Business Buyer
- Delivery Partner
- Admin

## Implemented Modules

- Auth with role-based registration and cookie-based JWT session
- Product catalog with bulk pricing, farmer ownership, image upload, and AI metadata hooks
- B2C and B2B order flows
- Negotiation system with real-time farmer-business chat
- Subscription plans for farmer and business monetization
- Delivery assignment and delivery status tracking
- Reviews for farmers
- Admin analytics, user management, farmer verification, and order oversight
- AI-ready product metadata service for price recommendation and demand scoring

## Environment Variables

### Server

Copy [server/.env.example](/home/sunny/Desktop/agrofresh/server/.env.example) to `server/.env`.

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ADMIN_EMAIL=admin@agrofresh.com
ADMIN_PASSWORD=Admin@123
```

### Client

Copy [client/.env.example](/home/sunny/Desktop/agrofresh/client/.env.example) to `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Local Setup

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Seed sample data

```bash
cd server
npm run seed
```

Seeded accounts include farmers, one business buyer, one delivery partner, and one admin.

### 3. Start development servers

```bash
cd server && npm run dev
cd client && npm run dev
```

## Key API Areas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/products`
- `GET /api/products`
- `POST /api/orders`
- `POST /api/orders/bulk`
- `POST /api/negotiations`
- `GET /api/negotiations/:id`
- `POST /api/subscriptions`
- `GET /api/delivery/orders`
- `PUT /api/delivery/assign/:orderId`
- `PUT /api/delivery/status/:orderId`
- `POST /api/reviews`
- `GET /api/reviews/:farmerId`
- `GET /api/admin/analytics`

## CI

GitHub Actions workflow is available at .github/workflows/ci.yml.

It runs on pushes to `main` / `master` and on pull requests, with two jobs:

- Server: `npm ci` and `npm test` in `server/` with test env vars
- Client: `npm ci` and `npm run build` in `client/`

## Deployment

### Backend on Render

1. Create a new Web Service from the `server` directory.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. Add all server environment variables from `server/.env.example`.
5. Set `CLIENT_URL` to your deployed Vercel frontend URL.

### Frontend on Vercel

1. Import the repository and select the `client` directory as the root.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to `https://your-render-service.onrender.com/api`
5. Set `VITE_SOCKET_URL` to `https://your-render-service.onrender.com`

## Scalability Notes

- Product AI metadata is isolated in [server/utils/aiSignals.js](/home/sunny/Desktop/agrofresh/server/utils/aiSignals.js) for future price recommendation and demand prediction services.
- Negotiations and chat are isolated from orders, allowing future procurement workflows or message moderation layers.
- Delivery and admin modules are separate route/controller groups, which keeps later microservice extraction straightforward.
- Monetization is introduced through `commissionAmount`, subscription plans, and featured product support.

## Verification Targets

Recommended smoke checks after install:

- Farmer login and product upload with image files
- Customer cart to checkout flow
- Business negotiation creation and bulk order placement
- Admin farmer verification and order review
- Delivery partner status updates
- Socket.io negotiation chat between farmer and business accounts
