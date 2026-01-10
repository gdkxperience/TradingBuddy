# Account Feature Specification

## Overview

This specification outlines the implementation of user accounts, authentication, and data isolation for Trading Buddy. The feature will enable users to create accounts, log in securely, and have all their trading data (calculations, journal entries, settings) linked to their account.

## Goals

1. **User Authentication**: Secure login and registration system
2. **Data Isolation**: Each user's data is private and isolated
3. **Data Persistence**: User data persists across devices and sessions
4. **Seamless Experience**: Minimal friction for account creation and login
5. **Migration Support**: Existing anonymous users can migrate their data

## Technical Stack

### Authentication Solution
- **NextAuth.js v5** (Auth.js) - Industry standard for Next.js authentication
- **Email/Password** - Primary authentication method
- **OAuth Providers** (Optional Phase 2) - Google, GitHub for quick sign-up

### Database Changes
- Extend existing `User` model with authentication fields
- Add `Session` and `Account` models for NextAuth.js
- Add `VerificationToken` model for email verification

### Security
- Password hashing with bcrypt
- JWT tokens for session management
- CSRF protection
- Rate limiting on auth endpoints
- Email verification (optional)

## Database Schema Updates

### Updated User Model

```prisma
model User {
  id                String        @id @default(cuid())
  email             String        @unique
  emailVerified     DateTime?
  name              String?
  password          String?       // Hashed password (null for OAuth users)
  image             String?       // Profile picture URL
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  calculations      Calculation[]
  journalEntries    JournalEntry[]
  settings          UserSettings?
  
  // Metadata
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([email])
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type              String   // "credentials" | "oauth"
  provider          String   // "credentials" | "google" | "github"
  providerAccountId String   // OAuth provider user ID
  
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id                String   @id @default(cuid())
  sessionToken      String   @unique
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  expires           DateTime
  
  @@index([userId])
}

model VerificationToken {
  identifier        String
  token             String   @unique
  expires           DateTime
  
  @@unique([identifier, token])
}

model UserSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // User preferences
  accountSize       Float?
  defaultRiskPercentage Float?  @default(5.0)
  defaultCashUsagePercentage Float? @default(50.0)
  checklistGatekeeperEnabled Boolean @default(true)
  
  // Dashboard preferences
  defaultView      String?  @default("calculator") // "calculator" | "dashboard" | "trading-dashboard"
  
  // Notification preferences (future)
  emailNotifications Boolean @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Migration Notes

- Existing `User` model already has `email` and `name` fields
- `JournalEntry` and `Calculation` models already have `userId` fields (optional)
- Need to add authentication-related fields and models
- Existing anonymous data (userId = null) can be migrated after user signs up

## API Endpoints

### Authentication Endpoints (NextAuth.js)

NextAuth.js provides these endpoints automatically:
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/callback/[provider]` - OAuth callback
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - List available providers

### Custom API Endpoints

#### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "..."
  }
}
```

**Errors:**
- `400` - Email already exists
- `400` - Invalid email format
- `400` - Password too weak
- `500` - Server error

#### POST /api/auth/migrate-data
Migrate anonymous data to user account.

**Request:**
```json
{
  "anonymousData": {
    "journalEntries": [...],
    "calculations": [...]
  }
}
```

**Response:**
```json
{
  "migrated": {
    "journalEntries": 5,
    "calculations": 12
  }
}
```

#### GET /api/user/profile
Get current user profile.

**Response:**
```json
{
  "id": "clx...",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null,
  "createdAt": "2025-01-27T...",
  "stats": {
    "totalTrades": 25,
    "totalCalculations": 150
  }
}
```

#### PATCH /api/user/profile
Update user profile.

**Request:**
```json
{
  "name": "John Updated",
  "image": "https://..."
}
```

#### GET /api/user/settings
Get user settings.

**Response:**
```json
{
  "accountSize": 10000,
  "defaultRiskPercentage": 5.0,
  "defaultCashUsagePercentage": 50.0,
  "checklistGatekeeperEnabled": true,
  "defaultView": "calculator"
}
```

#### PATCH /api/user/settings
Update user settings.

**Request:**
```json
{
  "accountSize": 12000,
  "defaultRiskPercentage": 4.0,
  "checklistGatekeeperEnabled": false
}
```

## User Flows

### Registration Flow

1. **User clicks "Sign Up"** on landing page or navigation
2. **Registration Modal Opens**
   - Email input (with validation)
   - Password input (with strength indicator)
   - Name input (optional)
   - Terms of Service checkbox
   - "Create Account" button
3. **Form Validation**
   - Email format check
   - Password strength check (min 8 chars, 1 uppercase, 1 number)
   - Email uniqueness check (real-time)
4. **Account Creation**
   - Hash password with bcrypt
   - Create user record
   - Create default UserSettings
   - Create session
   - Redirect to app
5. **Optional: Email Verification**
   - Send verification email
   - Show "Verify your email" banner
   - Allow app usage but show reminder

### Login Flow

1. **User clicks "Sign In"** on landing page or navigation
2. **Login Modal Opens**
   - Email input
   - Password input
   - "Remember me" checkbox
   - "Forgot Password?" link
   - "Sign In" button
   - OAuth buttons (Google, GitHub) - Phase 2
3. **Authentication**
   - Validate credentials
   - Check password hash
   - Create session
   - Set session cookie
4. **Redirect**
   - If "Remember me": Long-lived session (30 days)
   - Otherwise: Session cookie (browser session)
   - Redirect to last viewed page or default view

### Data Migration Flow

1. **User has anonymous data** (localStorage or userId = null)
2. **User signs up or logs in**
3. **Migration Prompt Appears**
   - "We found some data. Would you like to import it?"
   - Show count: "5 trades, 12 calculations"
   - "Import" and "Start Fresh" buttons
4. **If Import Selected**
   - Call `/api/auth/migrate-data`
   - Update all records with userId = null to new userId
   - Show success message
   - Refresh data
5. **If Start Fresh Selected**
   - Clear anonymous data
   - Continue with empty account

### Logout Flow

1. **User clicks "Sign Out"** in navigation
2. **Confirmation** (optional for first-time logout)
3. **Session Destroyed**
   - Clear session cookie
   - Delete session from database
4. **Redirect to Landing Page**
   - Show "You've been signed out" message
   - Option to sign in again

## UI Components

### AuthModal Component
Unified modal for login and registration with tab switching.

**Props:**
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `defaultTab?: 'login' | 'register'`

**Features:**
- Tab switching between Login and Register
- Form validation with error messages
- Password strength indicator
- Loading states
- OAuth buttons (Phase 2)

### UserMenu Component
Dropdown menu in navigation showing:
- User name and email
- Profile link
- Settings link
- Sign out button
- User avatar (if available)

### ProfilePage Component
User profile management page:
- Edit name and email
- Change password
- Upload profile picture
- Account statistics
- Delete account option

### Settings Integration
Extend existing Settings component:
- Link settings to user account
- Sync settings across devices
- Default values from UserSettings model

## Security Considerations

### Password Security
- **Hashing**: Use bcrypt with salt rounds (10-12)
- **Minimum Requirements**: 8+ characters, 1 uppercase, 1 number
- **No Password Storage**: Never store plain text passwords
- **Password Reset**: Secure token-based reset flow

### Session Security
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Secure Cookies**: HTTPS only in production
- **SameSite**: Strict CSRF protection
- **Session Expiry**: Configurable timeout (default: 30 days)
- **Token Rotation**: Refresh tokens on login

### Data Protection
- **Authorization Checks**: All API routes verify userId
- **Data Isolation**: Users can only access their own data
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent brute force attacks
- **SQL Injection**: Prisma ORM prevents SQL injection

### Privacy
- **Email Privacy**: Never expose emails publicly
- **Data Export**: Users can export their data (GDPR compliance)
- **Account Deletion**: Soft delete with data retention policy
- **No Tracking**: No analytics on authentication events

## Implementation Phases

### Phase 1: Core Authentication (MVP)
- [ ] Install NextAuth.js
- [ ] Update Prisma schema
- [ ] Create auth API routes
- [ ] Build AuthModal component
- [ ] Add UserMenu to navigation
- [ ] Update API routes to check authentication
- [ ] Add data migration flow
- [ ] Update UI to show login/signup buttons

**Timeline**: 1-2 weeks

### Phase 2: Enhanced Features
- [ ] Email verification
- [ ] Password reset flow
- [ ] Profile page
- [ ] User settings sync
- [ ] Account statistics
- [ ] Data export feature

**Timeline**: 1 week

### Phase 3: OAuth Integration (Optional)
- [ ] Google OAuth setup
- [ ] GitHub OAuth setup
- [ ] OAuth buttons in AuthModal
- [ ] Account linking

**Timeline**: 3-5 days

## API Route Updates

### Existing Routes Need Updates

#### GET /api/journal
**Before:**
```typescript
const entries = await prisma.journalEntry.findMany()
```

**After:**
```typescript
const session = await getServerSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const entries = await prisma.journalEntry.findMany({
  where: { userId: session.user.id }
})
```

#### POST /api/journal
**After:**
```typescript
const session = await getServerSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const entry = await prisma.journalEntry.create({
  data: {
    ...body,
    userId: session.user.id
  }
})
```

#### GET /api/calculations
**After:**
```typescript
const session = await getServerSession()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const calculations = await prisma.calculation.findMany({
  where: { userId: session.user.id }
})
```

## Client-Side Updates

### Authentication State Management

Create `src/lib/auth.ts`:
```typescript
import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading'
  }
}
```

### Protected Routes

Update components to check authentication:
```typescript
'use client'

import { useAuth } from '@/lib/auth'
import { AuthModal } from '@/components/AuthModal'

export function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) {
    return <AuthModal open={showAuth} onOpenChange={setShowAuth} />
  }
  
  // Render protected content
}
```

### Navigation Updates

Update Navigation component:
- Show "Sign In" / "Sign Up" when not authenticated
- Show UserMenu when authenticated
- Highlight current user's data

## Migration Strategy

### For Existing Users

1. **Anonymous Data Detection**
   - Check localStorage for existing data
   - Check database for userId = null records
   - Show migration prompt on first login

2. **Migration Process**
   - Create migration endpoint
   - Update all records with userId = null
   - Preserve timestamps and data integrity
   - Show success message

3. **Backward Compatibility**
   - Support anonymous usage (optional)
   - Show "Sign up to sync across devices" banner
   - Allow continued anonymous use with localStorage

### Database Migration

```bash
# Create migration
npx prisma migrate dev --name add_auth_tables

# Apply migration
npx prisma migrate deploy
```

## Testing Requirements

### Unit Tests
- Password hashing and validation
- Email validation
- Session creation and destruction
- Data isolation checks

### Integration Tests
- Registration flow
- Login flow
- Data migration flow
- API authorization checks

### E2E Tests
- Complete user journey: Sign up → Calculate → Save → View
- Cross-device data sync
- Logout and re-login persistence

## Success Metrics

- **Registration Rate**: % of visitors who create accounts
- **Login Rate**: % of registered users who log in regularly
- **Data Migration Rate**: % of users who migrate anonymous data
- **Session Duration**: Average time users stay logged in
- **Security**: Zero authentication-related breaches

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Social Login** (Google, GitHub, Twitter)
3. **Account Recovery** (Security questions, backup codes)
4. **Team Accounts** (Share data with team members)
5. **API Keys** (For programmatic access)
6. **Account Tiers** (Free, Pro, Enterprise)

## Dependencies

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.4",
    "bcryptjs": "^2.4.3",
    "@auth/prisma-adapter": "^2.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Environment Variables

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth (Phase 3)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

## Documentation Updates

- Update `FEATURES.md` with account features
- Update `SECURITY.md` with authentication security
- Create `AUTHENTICATION.md` guide for users
- Update API documentation with auth requirements

---

**Last Updated**: 2025-01-27  
**Status**: Specification - Ready for Implementation  
**Priority**: High
