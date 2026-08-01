# Copilot Instructions - Skill Space LMS Platform

## Project Overview
Next.js 16-based Learning Management System supporting **four user roles**: student, parent, tutor, and admin. Built with MongoDB, JWT authentication, and integrated with Stripe, Google Calendar, Zoom, and Cloudinary.

## Architecture

### Authentication & Authorization
- **Custom JWT-based auth** (no external auth providers like Clerk despite old docs)
- JWT tokens stored in **httpOnly cookies** (`token`) with 7-day expiration
- Token generation/verification: `src/lib/auth.ts` (`generateToken`, `verifyToken`, `getCurrentUser`)
- Edge-compatible middleware: `src/middleware.ts` uses Web Crypto API for JWT verification (not `jsonwebtoken` in edge runtime)
- Rate limiting via in-memory store: 5 login attempts per 15 minutes per IP (`src/lib/security.ts`)
- Client-side auth state: `src/contexts/AuthContext.tsx` - use `useAuth()` hook in components

### Database Patterns
- **Connection caching**: `src/lib/database.ts` maintains global connection pool to avoid reconnection overhead
- **Mongoose models** in `src/models/index.ts` - single file exports all models (User, Course, Session, Payment, etc.)
- User schema includes fields for all roles: `role`, `subjects`, `hourlyRate` (tutors), `children` (parents), `subscriptionStatus`, calendar tokens
- Always call `await connectDB()` at the start of API routes

### API Route Conventions
- Standard response format: `{ success: boolean, data/user/courses?: any, error/message?: string }`
- Auth checking pattern:
  ```typescript
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  ```
- Query params for pagination: `?page=1&limit=10`
- Input sanitization via `sanitizeInput()` and `isValidEmail()` from `src/lib/security.ts`
- Always include try-catch with error logging

### Role-Based Access
- **Four roles**: `student`, `parent`, `tutor`, `admin`
- Middleware protects routes in `src/middleware.ts`:
  - `/dashboard/*` requires authentication
  - `/dashboard/student/*` requires `student` role
  - `/dashboard/tutor/*` requires `tutor` role
  - Admin routes at `/dashboard/admin/*`
- Role determined from JWT token payload (`user.role`)

### UI & Styling
- **Tailwind CSS** with custom config in `tailwind.config.js`
- Primary brand color: `#7AC2F9` (light blue)
- Custom Button component pattern: `src/components/common/Button.tsx` - supports `href` (renders Link) or `onClick` (renders button)
- Components organized: `components/common/` (shared), `components/landing/` (homepage), `components/layout/` (Navbar, Footer)
- GSAP animations in landing page components (`src/components/landing/`)

### External Integrations
- **Stripe**: Payment routes in `src/app/api/payments/` - webhook at `/api/payments/webhook`
- **Google Calendar**: OAuth flow + tokens stored on User model (`googleAccessToken`, `googleRefreshToken`)
- **Cloudinary**: Video/document uploads via `src/app/api/upload/` endpoints
- **Email**: Nodemailer + Resend for notifications (`src/lib/email.ts`)
- **Zoom**: SDK integration for live classes (`src/lib/zoom.ts`)

## Development Workflows

### Running the App
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint check
```

### Database Setup
- MongoDB URI in `.env` as `MONGODB_URI`
- Seed test users: `GET /api/test-users` creates student/parent/tutor/admin accounts (all password: `password123`)
- Connection pooling configured: min 5, max 10 connections

### Testing Authentication
Use test accounts created via `/api/test-users`:
- Student: `student@example.com`
- Parent: `parent@example.com`
- Tutor: `tutor@example.com`
- Admin: `admin@example.com`

### Environment Variables
Critical vars in `.env`:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing (falls back to hardcoded dev secret with warning)
- `NEXT_PUBLIC_APP_URL` - App base URL
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` - Payments
- `CLOUDINARY_*` - Media uploads
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Calendar OAuth
- `RESEND_API_KEY` - Email sending

## Key Patterns & Conventions

### API Route Structure
```typescript
// Standard pattern in src/app/api/*/route.ts
export async function GET/POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false }, { status: 401 });
    
    // Business logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Error message' }, { status: 500 });
  }
}
```

### Client-Side Data Fetching
Use `credentials: 'include'` to send cookies:
```typescript
const response = await fetch('/api/endpoint', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});
```

### Protected Page Pattern
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Middleware redirects, but add check
  // Render dashboard
}
```

### Model References
Mongoose populate examples (from `src/app/api/courses/route.ts`):
```typescript
.populate('category', 'name icon color')
.populate('instructor', 'name avatar bio hourlyRate')
```

## Important Files
- [src/middleware.ts](../src/middleware.ts) - Route protection, JWT verification (edge-compatible)
- [src/lib/auth.ts](../src/lib/auth.ts) - Token generation, cookie management
- [src/lib/database.ts](../src/lib/database.ts) - MongoDB connection singleton
- [src/models/index.ts](../src/models/index.ts) - All Mongoose schemas
- [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx) - Client auth state
- [PRODUCTION_READY_SUMMARY.md](../PRODUCTION_READY_SUMMARY.md) - Deployment checklist, security features

## Project-Specific Notes
- Password validation relaxed in dev (see `isStrongPassword` in `src/lib/security.ts`) but rate limiting active
- Health check endpoint: `GET /api/health` for monitoring
- Logging utility at `src/lib/logger.ts` with `logger.authEvent()`, `logger.warn()`, etc.
- Hard navigation (`window.location.replace()`) used after login to ensure middleware picks up new cookie
- Dashboard redirects based on role: student→`/dashboard/student`, tutor→`/dashboard/tutor`, etc.
