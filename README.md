# Vaulta — Manual Wealth Tracker

A full-stack wealth tracking platform. Manually track stocks, crypto, real estate, cash, bonds, and more.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Zustand, Recharts |
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL |
| Auth | JWT + OTP email verification |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
vaulta/
├── frontend/          # React + Vite app
│   └── src/
│       ├── pages/     # SignUp, Login, VerifyEmail, Onboarding, Dashboard, AddAsset
│       ├── components/
│       ├── lib/       # Axios client, Zustand store
│       └── types/
└── backend/           # Express + TypeScript API
    └── src/
        ├── controllers/   # authController, assetController, userController, fxController
        ├── routes/
        ├── middleware/    # JWT auth, error handler
        ├── services/      # Email service
        └── config/        # DB + migrations
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/usekrewstudio/vaulta.git
cd vaulta
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vaulta
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api
```

### 4. Create Database

```bash
createdb vaulta
```

Migrations run automatically on backend startup.

### 5. Run in Development

```bash
# From root
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Assets (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets/portfolio` | Full portfolio summary |
| POST | `/api/assets` | Add asset |
| PATCH | `/api/assets/:id` | Update asset |
| DELETE | `/api/assets/:id` | Delete asset |

### FX
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fx/rates?base=NGN` | Get exchange rates |
| GET | `/api/fx/convert?from=USD&to=NGN&amount=100` | Convert amount |
| GET | `/api/fx/currencies` | Supported currencies |

### User (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/user/profile` | Update profile |
| PATCH | `/api/user/password` | Change password |
| DELETE | `/api/user/account` | Delete account |

---

## Supported Asset Types
`stock` · `crypto` · `real_estate` · `cash` · `bond` · `mutual_fund` · `pension` · `other`

## Supported Currencies
`USD` · `NGN` · `GHS` · `KES` · `ZAR` · `GBP` · `EUR` · `CAD` · `AUD` · `JPY`

---

## Deployment

### Backend (e.g. Railway, Render)
```bash
cd backend
npm run build
npm start
```

Set all env vars from `.env.example` in your hosting dashboard.

### Frontend (e.g. Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy /dist folder
```

Set `VITE_API_URL=https://your-api-domain.com/api`
