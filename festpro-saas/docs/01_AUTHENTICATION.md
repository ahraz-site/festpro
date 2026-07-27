# FestPro Authentication Module — Complete Official Documentation

**Module:** Authentication  
**Version:** 1.0  
**Dependencies:** None (foundation module)  
**Applies To:** All users, all organizations

---

# Section 1: Introduction

## 1.1 What This Module Is

The Authentication Module manages user identity verification, session lifecycle, and access control for the entire FestPro platform. It is the gateway through which every user — from platform administrators to participants — proves their identity before accessing any system resource.

## 1.2 Why It Exists

FestPro handles sensitive personal data (participant profiles, financial transactions, medical records) and organizational data (festival configurations, competition results). Without a robust authentication system, unauthorized access would compromise data security, violate privacy regulations, and erode trust. The Authentication Module ensures that:

- Every user is uniquely identified
- Access is granted only to verified identities
- Sessions are securely maintained and automatically expire
- Password changes and resets are cryptographically safe
- Audit trails capture all authentication events

## 1.3 When to Use It

Every interaction with FestPro begins with authentication. Specific authentication flows include:

| Scenario | Authentication Method |
|----------|---------------------|
| First-time user registration | Email + password + verification |
| Daily platform access | Email + password or OAuth |
| Forgotten password recovery | Email-based reset link |
| High-security operations | Email + password + MFA TOTP code |
| Mobile device access | Password + biometric (fingerprint/face) |
| API integration | Service role key (server-side only) |

## 1.4 Business Purpose

From a business perspective, authentication serves these objectives:

| Objective | Implementation |
|-----------|---------------|
| Identity assurance | Email verification, optional MFA |
| Regulatory compliance | Audit logging of all auth events |
| User convenience | OAuth SSO, biometric login, remember-me |
| Security hardening | Rate limiting, session expiry, bcrypt hashing |
| Tenant isolation | Auth tied to organization membership via RLS |

## 1.5 Real-World Examples

**Example 1 — School Festival:** A teacher registers as an Organization Owner, creates their school's account, and invites five colleagues as Festival Directors and Judges. Each team member authenticates with their own email and password.

**Example 2 — Multi-Day District Festival:** Three hundred participants register through the public portal. Each receives a verification email. On festival day, they log in to check their competition schedule. Sessions auto-expire after 1 hour of inactivity.

**Example 3 — Judge Login with MFA:** A judge requests MFA enforcement for their account. They scan a QR code with Google Authenticator. On subsequent logins, they enter a 6-digit code after their password.

---

# Section 2: Before You Start

## 2.1 Requirements

### User Requirements

| Requirement | Specification |
|-------------|---------------|
| Email address | Valid, accessible for verification |
| Password | Minimum 6 characters |
| Browser | Modern browser with JavaScript enabled |
| Cookies | Enabled for session persistence |
| Internet connection | Required for authentication operations |

### Administrator Requirements

| Requirement | Specification |
|-------------|---------------|
| Supabase project access | Auth configuration in Supabase Dashboard |
| Domain ownership | For custom email sender domain |
| OAuth provider credentials | For SSO configuration (if needed) |

## 2.2 Permissions

| Auth Operation | Permission Required | Notes |
|---------------|-------------------|-------|
| Register | None (public) | Anyone can sign up |
| Login | None (public) | Anyone can attempt login |
| Reset password | None (public) | Anyone can request reset |
| Update own password | Authenticated user | Requires current session |
| Manage auth settings | Platform Owner / Admin | Supabase Dashboard access |
| View auth audit log | Organization Owner / Admin | Via platform audit log |

## 2.3 Dependencies

The Authentication Module has zero dependencies — it must be configured and operational before any other module. However, the following external services are required:

| Service | Purpose | Configuration Location |
|---------|---------|----------------------|
| Supabase Auth | Core authentication provider | Supabase Dashboard → Authentication |
| Email provider | Verification and reset emails | Supabase Dashboard → Authentication → Settings |
| OAuth providers (optional) | Social login | Supabase Dashboard → Authentication → Providers |

## 2.4 Previous Modules Required

None. Authentication is the first module to be configured.

## 2.5 Configuration Checklist

Before enabling authentication for production:

- [ ] Supabase project created and accessible
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured in environment
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured in environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured in environment (server-only)
- [ ] `NEXT_PUBLIC_APP_URL` configured in environment
- [ ] Supabase Site URL configured (matches deployment URL)
- [ ] Redirect URLs configured in Supabase Dashboard
- [ ] Email provider configured (SMTP or built-in)
- [ ] Email confirmation setting decided (on/off)
- [ ] Password policy configured
- [ ] Rate limiting configured
- [ ] OAuth providers enabled (if needed)
- [ ] MFA policy configured (if needed)

---

# Section 3: Navigation

## 3.1 Authentication Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | User sign-in with email/password |
| Sign Up | `/signup` | New user registration |
| Forgot Password | `/forgot-password` | Initiate password reset |
| Auth Callback | `/auth/callback` | Handle OAuth + password reset callbacks |
| Verify | `/verify` | Email verification code entry |

## 3.2 Login Page Layout

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │          FestPro Logo                    │ │
│  │                                         │ │
│  │          Sign In                         │ │
│  │     Access your account                 │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │ Email                           │    │ │
│  │  │ [you@example.com              ] │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │ Password                        │    │ │
│  │  │ [••••••••••••••••            ] │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │ ◻ Remember me                   │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │         Sign In                 │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  Forgot password?                       │ │
│  │                                         │ │
│  │  Don't have an account? Sign Up         │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 3.3 Sign Up Page Layout

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │       Create your account               │ │
│  │                                         │ │
│  │  First Name       Last Name             │ │
│  │  [John           ] [Doe               ] │ │
│  │                                         │ │
│  │  Email Address                          │ │
│  │  [john@example.com                    ] │ │
│  │                                         │ │
│  │  Password                               │ │
│  │  [••••••••                          ] │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐    │ │
│  │  │      Create Account             │    │ │
│  │  └─────────────────────────────────┘    │ │
│  │                                         │ │
│  │  Already have an account? Sign In       │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 3.4 Breadcrumbs

Authentication pages do not display breadcrumbs (they are standalone entry points).

## 3.5 Buttons

| Button | Page | Action |
|--------|------|--------|
| **Sign In** | `/login` | Submit credentials for authentication |
| **Create Account** | `/signup` | Submit registration form |
| **Send Reset Link** | `/forgot-password` | Send password reset email |
| **Update Password** | `/auth/callback` (recovery mode) | Submit new password |
| **Request new reset link** | `/auth/callback` (error mode) | Navigate to forgot password |

## 3.6 Tabs

No tabs exist on authentication pages (each page is single-purpose).

## 3.7 Filters

No filters exist on authentication pages.

## 3.8 Search

No search functionality on authentication pages.

---

# Section 4: Screen Overview

## 4.1 Login Screen Elements

| Element | Type | Description |
|---------|------|-------------|
| FestPro Logo | Image | Brand logo, links to landing page |
| "Sign In" heading | Text | Page title |
| "Access your account" subtitle | Text | Page description |
| Email field | Input | Email address entry |
| Password field | Input (password) | Password entry with show/hide toggle |
| "Remember me" checkbox | Checkbox | Persist session across browser closes |
| Sign In button | Button (primary) | Submit login form |
| "Forgot password?" link | Link | Navigate to password reset |
| "Sign Up" link | Link | Navigate to registration |
| Error toast | Notification | Validation/auth error message |

## 4.2 Sign Up Screen Elements

| Element | Type | Description |
|---------|------|-------------|
| First Name field | Input | User's given name |
| Last Name field | Input | User's family name |
| Email field | Input (email) | Email address |
| Password field | Input (password) | Password entry |
| Create Account button | Button (primary) | Submit registration |

## 4.3 Forgot Password Screen Elements

| Element | Type | Description |
|---------|------|-------------|
| Email field | Input (email) | Registered email address |
| Send Reset Link button | Button (primary) | Submit reset request |
| Success state | Card | Shows after email sent successfully |
| "try again" link | Link | Reset form to resend email |
| "Back to sign in" link | Link | Navigate to login |

## 4.4 Callback Screen Elements

| Element | Type | Description |
|---------|------|-------------|
| Loading spinner | Animation | While processing auth code |
| Password field | Input (password) | New password (recovery mode) |
| Update Password button | Button (primary) | Submit new password (recovery mode) |
| Error card | Card | Invalid/expired link message |

---

# Section 5: Every Form

## 5.1 Sign In Form

### Fields

| Field | Label | Type | Required | Validation | Default | Placeholder |
|-------|-------|------|----------|------------|---------|-------------|
| email | Email | email | Yes | Must be a valid email format, max 255 characters | Empty | you@example.com |
| password | Password | password | Yes | Must be at least 6 characters, max 72 characters | Empty | Enter your password |

### Business Rules

| Rule | Description |
|------|-------------|
| Rate limiting | Max 10 failed attempts per IP per 60 seconds |
| Account lockout | After 20 failed attempts, account locked for 15 minutes |
| Email confirmation check | If enabled, unconfirmed emails cannot log in |
| Session creation | On success, JWT session created with 1-hour expiry |
| Remember me | If checked, session persists for 30 days |

### Validation Messages

| Scenario | Message |
|----------|---------|
| Empty email | "Please enter your email" |
| Invalid email format | "Please enter a valid email address" |
| Empty password | "Please enter your password" |
| Password too short | "Password must be at least 6 characters" |
| Invalid credentials | "Invalid login credentials" |
| Email not confirmed | "Email not confirmed. Please check your inbox or request a new verification email." |
| Account locked | "Account temporarily locked. Try again in 15 minutes." |
| Rate limit exceeded | "Too many requests. Please wait 60 seconds before trying again." |

## 5.2 Sign Up Form

### Fields

| Field | Label | Type | Required | Validation | Default | Placeholder |
|-------|-------|------|----------|------------|---------|-------------|
| first_name | First Name | text | Yes | 2-100 characters, letters, hyphens, apostrophes only | Empty | John |
| last_name | Last Name | text | Yes | 2-100 characters, letters, hyphens, apostrophes only | Empty | Doe |
| email | Email Address | email | Yes | Valid email format, globally unique across all organizations | Empty | john@example.com |
| password | Password | password | Yes | Minimum 6 characters | Empty | Create a password |

### Business Rules

| Rule | Description |
|------|-------------|
| Email uniqueness | Email must not already exist in auth.users |
| Email domain check | No domain restrictions (all valid emails accepted) |
| Password policy | Default: min 6 chars (configurable in Supabase Dashboard) |
| Profile creation | After auth.signUp success, trigger `on_auth_user_created` inserts into `profiles` table |
| Organization creation | After profile creation, Server Action creates organization + organization_membership |
| Email verification | If enabled, verification email sent; user cannot log in until verified |
| Rate limiting | Max 5 signups per email per hour |

### Validation Messages

| Scenario | Message |
|----------|---------|
| Empty first name | "First name is required" |
| First name too short | "First name must be at least 2 characters" |
| First name invalid chars | "First name can only contain letters, hyphens, and apostrophes" |
| Empty last name | "Last name is required" |
| Invalid email format | "Please enter a valid email address" |
| Email already registered | "An account with this email already exists" |
| Password too short | "Password must be at least 6 characters" |
| Password too long | "Password must be at most 72 characters" |

## 5.3 Forgot Password Form

### Fields

| Field | Label | Type | Required | Validation | Default | Placeholder |
|-------|-------|------|----------|------------|---------|-------------|
| email | Email | email | Yes | Valid email format, must exist in auth.users | Empty | you@example.com |

### Business Rules

| Rule | Description |
|------|-------------|
| Email existence | System does NOT reveal whether email exists (prevents enumeration attacks) |
| Rate limiting | Max 3 reset requests per email per hour |
| Redirect URL | `NEXT_PUBLIC_APP_URL/auth/callback?redirect_to=/profile` |
| Link expiry | Reset link expires after 1 hour |
| Session creation | After code exchange, session created with PASSWORD_RECOVERY flag |

### Validation Messages

| Scenario | Message |
|----------|---------|
| Empty email | "Please enter your email" |
| Invalid email format | "Please enter a valid email address" |
| Success | "Password reset link sent to your email" (same message regardless of whether email exists) |

## 5.4 Update Password Form (Recovery)

### Fields

| Field | Label | Type | Required | Validation | Default | Placeholder |
|-------|-------|------|----------|------------|---------|-------------|
| password | New Password | password | Yes | Minimum 6 characters | Empty | Min. 6 characters |

### Business Rules

| Rule | Description |
|------|-------------|
| Password history | Not checked (new password can match old password) |
| Password strength | Minimum 6 characters enforced |
| Session requirement | User must have an active session (created by code exchange from reset link) |
| Post-update | User is signed out and redirected to login |
| Notification | No email notification sent on password change |

### Validation Messages

| Scenario | Message |
|----------|---------|
| Empty password | "Password must be at least 6 characters" |
| Password too short | "Password must be at least 6 characters" |
| Success | "Password updated! Redirecting to login..." |

## 5.5 Server Action Validations

Every authentication form validates data twice:

1. **Client-side validation** (browser): Immediate feedback on field blur and before submission
2. **Server-side validation** (Server Action): Independent validation with Zod schemas

If client-side validation passes but server-side validation fails, the server error is returned and displayed as a toast notification.

---

# Section 6: Every Button

## 6.1 Sign In Button

| Property | Value |
|----------|-------|
| Label | Sign In |
| Icon | None |
| Location | Login form, below password field |
| Width | Full (100%) |
| Color | Indigo (#4F46E5) |
| States | Default, Hover, Active, Loading, Disabled |
| Loading state | Shows spinner, label text hidden, all inputs disabled |
| Disabled state | Grayed out when required fields empty or invalid |
| Action | Calls `signIn` Server Action with `{ email, password }` |

## 6.2 Create Account Button

| Property | Value |
|----------|-------|
| Label | Create Account |
| Icon | None |
| Location | Sign up form, below password field |
| Width | Full (100%) |
| Color | Indigo (#4F46E5) |
| States | Default, Hover, Active, Loading, Disabled |
| Loading state | Shows spinner, label text hidden, all inputs disabled |
| Action | Calls `signUp` Server Action with `{ first_name, last_name, email, password }` |

## 6.3 Send Reset Link Button

| Property | Value |
|----------|-------|
| Label | Send Reset Link |
| Icon | None |
| Location | Forgot password form |
| Width | Full (100%) |
| Color | Indigo (#4F46E5) |
| States | Default, Hover, Active, Loading, Disabled |
| Action | Calls `resetPassword` Server Action with `{ email }` |

## 6.4 Update Password Button

| Property | Value |
|----------|-------|
| Label | Update Password |
| Icon | None |
| Location | Callback page (password recovery mode) |
| Width | Full (100%) |
| Color | Indigo (#4F46E5) |
| States | Default, Hover, Active, Loading, Disabled |
| Action | Calls `supabase.auth.updateUser({ password })` directly |

## 6.5 Request New Reset Link Button

| Property | Value |
|----------|-------|
| Label | Request new reset link |
| Icon | None |
| Location | Callback page (error mode) |
| Width | Auto |
| Color | Indigo (#4F46E5) |
| Action | Navigates to `/forgot-password` |

---

# Section 7: Step-by-Step Guide

## 7.1 User Registration

**Step 1:** Navigate to the FestPro signup page at `/signup`.

**Step 2:** Enter your **First Name** in the First Name field. Minimum 2 characters, letters only.

**Step 3:** Enter your **Last Name** in the Last Name field. Minimum 2 characters, letters only.

**Step 4:** Enter your **Email Address** in the email field. Use a valid, accessible email address.

**Step 5:** Enter a **Password** with at least 6 characters.

**Step 6:** Click the **Create Account** button.

**Step 7:** Wait for the Server Action to process:
   - 7a: Supabase Auth creates the user in `auth.users`
   - 7b: Database trigger `on_auth_user_created` inserts a row into `profiles`
   - 7c: Server Action creates a new organization record
   - 7d: Server Action inserts an `organization_members` row with role `organization_owner`

**Step 8:** If email confirmation is enabled, check your email inbox.

**Step 9:** Click the verification link in the email. This redirects to `/auth/callback?code=...`.

**Step 10:** The callback page exchanges the code for a session and redirects to the organization dashboard.

**Step 11:** Complete the onboarding checklist as prompted.

## 7.2 User Login

**Step 1:** Navigate to the FestPro login page at `/login`.

**Step 2:** Enter your registered **Email Address**.

**Step 3:** Enter your **Password**.

**Step 4:** Optionally check **Remember me** to persist your session across browser closes.

**Step 5:** Click the **Sign In** button.

**Step 6:** The Server Action calls `supabase.auth.signInWithPassword({ email, password })`.

**Step 7:** On success:
   - 7a: Session cookie is set by the server Supabase client
   - 7b: User is redirected to the organization dashboard
   - 7c: Audit log entry is created for login

**Step 8:** On failure, an error toast is displayed with the specific message.

## 7.3 Password Reset (Full Flow)

**Initiation:**

**Step 1:** On the login page, click **Forgot password?**.

**Step 2:** The browser navigates to `/forgot-password`.

**Step 3:** Enter the email address associated with your account.

**Step 4:** Click **Send Reset Link**.

**Step 5:** The Server Action calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.

**Step 6:** A message "Password reset link sent to your email" is displayed (same message regardless of whether the email exists).

**Completion:**

**Step 7:** Check your email inbox for the password reset email.

**Step 8:** Click the reset link in the email.

**Step 9:** The browser navigates to `https://[domain]/?code=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`.

**Step 10:** The middleware detects the `?code` query parameter on the root path.

**Step 11:** The middleware redirects to `/auth/callback?code=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`.

**Step 12:** The callback page (client component) reads the `code` from the URL search parameters using `window.location.search`.

**Step 13:** The component calls `supabase.auth.exchangeCodeForSession(code)`.

**Step 14:** Supabase processes the code and creates a session. The `onAuthStateChange` event fires with `SIGNED_IN`.

**Step 15:** The callback checks the `redirect_to` parameter. Since it equals `/profile`, the mode is set to `recovery`.

**Step 16:** The password reset form is displayed.

**Step 17:** Enter a new password (minimum 6 characters).

**Step 18:** Click **Update Password**.

**Step 19:** The component calls `supabase.auth.updateUser({ password })`.

**Step 20:** On success, a toast confirmation is shown.

**Step 21:** After 2 seconds, the user is redirected to `/login`.

**Step 22:** The user logs in with the new password.

## 7.4 MFA Setup (Administrator)

**Step 1:** Ensure MFA is enabled in Supabase Dashboard: Authentication → Settings → Multi-Factor Authentication.

**Step 2:** Log in to FestPro as the user who wants MFA.

**Step 3:** Navigate to Profile → Security → Enable MFA.

**Step 4:** Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.).

**Step 5:** Enter the 6-digit code from the authenticator app to verify setup.

**Step 6:** Save the recovery codes displayed (10 codes, each usable once).

**Step 7:** On next login, enter password first, then the TOTP code from the authenticator app.

---

# Section 8: Real Workflow

## 8.1 New User Onboarding

```
User visits FestPro platform
    │
    ▼
User clicks "Get Started" on landing page
    │
    ▼
User navigates to /signup
    │
    ▼
User fills registration form:
  - First name: "Aarav"
  - Last name: "Sharma"
  - Email: "aarav@example.com"
  - Password: "securePassword123"
    │
    ▼
System validates all fields
  - Client-side: format checks
  - Server-side: email uniqueness, password policy
    │
    ▼ (if validation passes)
Supabase Auth creates user in auth.users
    │
    ▼ (trigger fires)
on_auth_user_created trigger inserts into profiles:
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (auth_user_id, 'aarav@example.com', 'Aarav', 'Sharma', 'organization_owner')
    │
    ▼ (Server Action continues)
Organization created:
  INSERT INTO organizations (name, slug)
  VALUES ("Aarav's Organization", "aarav-xy12")
    │
    ▼
Organization membership created:
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (org_id, auth_user_id, 'organization_owner')
    │
    ▼ (if email confirmation enabled)
Verification email sent to aarav@example.com
    │
    ▼ (user clicks link)
/auth/callback?code=xxx
    │
    ▼
Code exchanged for session
    │
    ▼
Redirected to /dashboard/organization/onboarding
    │
    ▼
Onboarding checklist displayed:
  ☐ Invite team members
  ☐ Create first festival
  ☐ Set up competition categories
  ☐ Configure judging criteria
  ☐ Publish festival to public portal
```

## 8.2 Daily User Login

```
User navigates to /login
    │
    ▼
User enters email: "aarav@example.com"
User enters password: "securePassword123"
    │
    ▼
Server Action: signIn({ email, password })
    │
    ▼
supabase.auth.signInWithPassword({ email, password })
    │
    ▼ (Supabase validates)
Email exists? ✅
  → Check password hash (bcrypt compare)
      → Match? ✅
          → Create JWT session (1 hour expiry)
          → Set session cookie
          → Return success
      → No match?
          → Increment failed attempts counter
          → Return "Invalid login credentials"
          → After 10 failures: show "Too many requests" (60s cooldown)
          → After 20 failures: lock account (15 min)
    │
    ▼ (success)
Cookie set via middleware
    │
    ▼
Redirect to /dashboard
    │
    ▼
Middleware checks session → valid ✅
    │
    ▼
Dashboard loads with organization context
```

---

# Section 9: Business Rules

## 9.1 Authentication Business Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| AUTH-001 | Each email can only be associated with one user account | Supabase Auth (unique constraint) |
| AUTH-002 | Passwords are never stored in plaintext; bcrypt with 12 rounds | Supabase Auth |
| AUTH-003 | Session tokens expire after 1 hour of inactivity | Supabase Auth + middleware |
| AUTH-004 | Refresh tokens are rotated on each use | Supabase Auth |
| AUTH-005 | Maximum 10 failed login attempts per minute per IP | Supabase Auth rate limiting |
| AUTH-006 | Account locks after 20 consecutive failed attempts for 15 minutes | Supabase Auth |
| AUTH-007 | Password reset links expire after 1 hour | Supabase Auth |
| AUTH-008 | Users cannot be created with an email already in use | Database unique constraint |
| AUTH-009 | Profile is auto-created when user is created | Database trigger |
| AUTH-010 | Organization is auto-created on first user signup | Server Action |
| AUTH-011 | The first user of an organization gets `organization_owner` role | Server Action |
| AUTH-012 | Password reset does not reveal whether email exists in system | Application logic |
| AUTH-013 | Session invalidation occurs on password change | Supabase Auth |
| AUTH-014 | Authentication operations are logged to audit trail | Server Action |
| AUTH-015 | MFA enrollment is per-user, not per-organization | Supabase Auth |

## 9.2 Session Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SESS-001 | Session cookie is HTTP-only (not accessible via JavaScript) | Supabase SSR library |
| SESS-002 | Session cookie is SameSite=Lax | Supabase SSR library |
| SESS-003 | Session cookie is Secure (HTTPS only in production) | Next.js configuration |
| SESS-004 | Session is automatically refreshed by middleware on each request | Middleware |
| SESS-005 | User is redirected to login if session is invalid/expired | Middleware |
| SESS-006 | Public routes bypass session check | Middleware route configuration |

---

# Section 10: Permissions

## 10.1 Authentication Permissions by Role

| Permission | Platform Owner | Org Owner | Org Admin | Festival Director | Manager | Judge | Finance | Media | Volunteer | Reception | Participant |
|------------|:--------------:|:---------:|:---------:|:-----------------:|:-------:|:-----:|:-------:|:-----:|:---------:|:---------:|:-----------:|
| Register new account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset own password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update own password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enable MFA | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage auth settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View auth audit log | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Impersonate user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# Section 11: Notifications

## 11.1 Authentication Notifications

| Notification | Trigger | Channel | Template Variables |
|-------------|---------|---------|-------------------|
| Welcome email | New registration | Email | `{{name}}`, `{{verify_url}}` |
| Email verification | New registration | Email | `{{verify_url}}` |
| Password reset | Reset requested | Email | `{{reset_url}}` |
| Account locked | 20 failed attempts | Email | `{{name}}`, `{{unlock_time}}` |
| Password changed | Password updated | Email (optional) | `{{name}}`, `{{time}}` |
| MFA disabled | MFA turned off | Email | `{{name}}`, `{{time}}` |

---

# Section 12: Reports

No dedicated reports exist for the Authentication Module. Authentication events are captured in the general audit log. See the Security & Audit documentation for reportable auth metrics:

- Login attempts (success/failure) over time
- New user registrations over time
- Password reset requests over time
- Active sessions per user

---

# Section 13: Analytics

## 13.1 Authentication Metrics

| Metric | Data Source | Visualization |
|--------|-------------|---------------|
| New signups per day | activity_log | Line chart |
| Login success rate | activity_log | Percentage gauge |
| Most active login hours | activity_log | Heat map |
| Registration by domain | auth.users | Pie chart |
| Password reset frequency | activity_log | Bar chart |

These metrics are accessible via the Admin → Analytics dashboard (Platform Owner only).

---

# Section 14: Search

Authentication pages (login, signup, forgot password) do not have search functionality.

---

# Section 15: Filters

Authentication pages do not have filter functionality.

---

# Section 16: Import

User import is supported via Supabase Dashboard (not within the FestPro application):

**Supabase Dashboard → Authentication → Users → Invite user** (single)  
**Supabase Dashboard → Authentication → Users → Import users** (bulk CSV)

---

# Section 17: Export

Authentication data export is available through:

**Supabase Dashboard → Authentication → Users → Download as CSV**  
Includes: Email, Created date, Last sign-in, Provider, Confirmed

---

# Section 18: Bulk Actions

Bulk actions on users require Supabase Dashboard access:

| Action | Location | Description |
|--------|----------|-------------|
| Bulk invite | Supabase Dashboard → Auth → Users → Import | Upload CSV with email list |
| Bulk delete | Supabase Dashboard → Auth → Users | Select multiple → Delete |
| Bulk confirm | Supabase Dashboard → Auth → Users | Select multiple → Confirm |

---

# Section 19: Automation

## 19.1 Automated Authentication Flows

| Trigger | Automated Action |
|---------|-----------------|
| New user registration | Auto-create profile via trigger |
| New user registration | Auto-create organization + membership (first user) |
| Password change | Invalidate all existing sessions |
| Session expiry | Redirect to login |
| Account lockout (15 min) | Auto-unlock after 15 minutes |

---

# Section 20: AI Features

No AI features exist in the Authentication Module.

---

# Section 21: Mobile App

## 21.1 Mobile Authentication

| Feature | Support | Details |
|---------|:-------:|---------|
| Biometric login (fingerprint) | ✅ | Via browser WebAuthn API |
| Biometric login (face) | ✅ | Via browser WebAuthn API |
| Session persistence | ✅ | Cookie-based, survives app close |
| Offline login | ✅ | Cached session allows limited offline access |
| Push notification auth | ❌ | Not applicable |

---

# Section 22: API

## 22.1 Authentication Server Actions

| Action | Import Path | Input | Output | Description |
|--------|-------------|-------|--------|-------------|
| `signUp` | `@/lib/actions/auth` | `{ first_name, last_name, email, password }` | `{ success, error }` | Register new user + org |
| `signIn` | `@/lib/actions/auth` | `{ email, password }` | `{ success, error }` | Authenticate user |
| `signOut` | `@/lib/actions/auth` | None | `{ success }` | End session |
| `resetPassword` | `@/lib/actions/auth` | `{ email }` | `{ success, error }` | Send reset email |
| `updatePassword` | `@/lib/actions/auth` | `{ password }` | `{ success, error }` | Update password |

## 22.2 Supabase Auth API (Direct)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `supabase.auth.signUp({ email, password })` | Client | Register new user |
| `supabase.auth.signInWithPassword({ email, password })` | Client | Login |
| `supabase.auth.signOut()` | Client | Logout |
| `supabase.auth.resetPasswordForEmail(email)` | Client | Send reset email |
| `supabase.auth.updateUser({ password })` | Client | Update password |
| `supabase.auth.exchangeCodeForSession(code)` | Client | Exchange OAuth/callback code |
| `supabase.auth.getUser()` | Client/Server | Get current user |
| `supabase.auth.getSession()` | Client/Server | Get current session |

---

# Section 23: Database

## 23.1 Authentication Tables

### `auth.users` (Supabase-managed)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Email address (unique) |
| phone | VARCHAR(50) | Phone number |
| confirmed_at | TIMESTAMPTZ | Email verification timestamp |
| email_confirmed_at | TIMESTAMPTZ | Email confirmation timestamp |
| last_sign_in_at | TIMESTAMPTZ | Last successful login |
| raw_user_meta_data | JSONB | User metadata (first_name, last_name) |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### `public.profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | User identifier |
| email | VARCHAR(255) | NOT NULL | Email address |
| first_name | VARCHAR(100) | NOT NULL | Given name |
| last_name | VARCHAR(100) | NOT NULL | Family name |
| avatar_url | TEXT | NULLABLE | Profile picture |
| phone | VARCHAR(50) | NULLABLE | Phone number |
| role | user_role | NOT NULL, DEFAULT 'participant' | Platform role |
| organization_id | UUID | FK → organizations(id) ON DELETE SET NULL | Current org |
| is_active | BOOLEAN | DEFAULT true | Account status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## 23.2 Authentication Indexes

| Index | Table | Column | Purpose |
|-------|-------|--------|---------|
| users_email_idx | auth.users | email | Fast email lookup during login |
| profiles_email_idx | profiles | email | Fast email lookup |
| profiles_role_idx | profiles | role | Role-based queries |
| profiles_org_idx | profiles | organization_id | Organization-based queries |

## 23.3 Authentication Triggers

| Trigger | Event | Function | Purpose |
|---------|-------|----------|---------|
| on_auth_user_created | AFTER INSERT ON auth.users | handle_new_user() | Auto-create profile row |

### handle_new_user() Function Logic

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'organization_owner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 23.4 Entity Relationships

```
auth.users (1) ────── (1) profiles
                              │
                              │ organization_id
                              │
                    organizations (1) ──── (many) organization_members ──── (many) auth.users
```

---

# Section 24: Security

## 24.1 Authentication Security Measures

| Measure | Implementation | Detail |
|---------|---------------|--------|
| Password hashing | bcrypt | 12 salt rounds |
| Session signing | RS256 | RSA signature with 2048-bit key |
| Session transport | HTTP-only cookie | Not accessible via document.cookie |
| CSRF protection | SameSite=Lax cookie attribute | Prevents cross-site request forgery |
| Rate limiting | Supabase Auth + application | Per-IP, per-email limits |
| Account lockout | Supabase Auth | After 20 failed attempts |
| Email verification | Optional | Prevents unverified account use |
| Password reset expiry | 1 hour | Reset link invalid after expiry |
| MFA | TOTP (time-based OTP) | 6-digit code, 30-second window |
| OAuth state parameter | PKCE flow | Prevents CSRF on OAuth callbacks |

## 24.2 Environment Variable Security

| Variable | Exposure | Security Measure |
|----------|----------|------------------|
| NEXT_PUBLIC_SUPABASE_URL | Public (browser) | Intended to be public |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public (browser) | Restricted by RLS, not a secret |
| SUPABASE_SERVICE_ROLE_KEY | Server-only | Never exposed to client code |
| NEXT_PUBLIC_APP_URL | Public (browser) | Intended to be public |

⚠️ **The service role key bypasses all RLS. It must NEVER be used in client-side code or exposed to the browser.**

## 24.3 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "aud": "authenticated",
  "role": "authenticated",
  "exp": 1700000000,
  "iat": 1699996400,
  "user_metadata": {
    "first_name": "Aarav",
    "last_name": "Sharma"
  }
}
```

---

# Section 25: Audit & Compliance

## 25.1 Authentication Audit Events

| Event | Logged Data | Retention |
|-------|-------------|-----------|
| User signup | `{ action: 'auth.signup', user_id, email }` | Permanent |
| User login | `{ action: 'auth.login', user_id, ip_address, user_agent }` | Permanent |
| User logout | `{ action: 'auth.logout', user_id }` | 90 days |
| Login failure | `{ action: 'auth.login_failed', email, ip_address }` | 90 days |
| Password reset requested | `{ action: 'auth.reset_requested', user_id }` | 90 days |
| Password updated | `{ action: 'auth.password_updated', user_id }` | Permanent |
| MFA enabled | `{ action: 'auth.mfa_enabled', user_id }` | Permanent |
| MFA disabled | `{ action: 'auth.mfa_disabled', user_id }` | Permanent |
| Account locked | `{ action: 'auth.account_locked', user_id, reason }` | Permanent |
| Account unlocked | `{ action: 'auth.account_unlocked', user_id }` | Permanent |

## 25.2 Compliance Frameworks

| Framework | Requirement | FestPro Implementation |
|-----------|-------------|----------------------|
| GDPR | Right to deletion | Account deletion via admin |
| GDPR | Data portability | User data export available |
| SOC 2 | Access control | RBAC + MFA + audit logging |
| SOC 2 | Authentication monitoring | Auth audit log with timestamps |

---

# Section 26: Activity Timeline

The authentication activity timeline shows a user's recent authentication events in reverse chronological order:

```
Today, 10:32 AM    ─ Login successful
Today, 10:31 AM    ─ Failed login attempt
Today, 09:15 AM    ─ Password reset requested
Yesterday, 18:00   ─ Session expired
Yesterday, 09:00   ─ Login successful
2 days ago         ─ MFA enabled
```

Access from Profile → Security → Activity Timeline.

---

# Section 27: Version History

The Authentication Module does not maintain version history for individual records.

---

# Section 28: Best Practices

1. **Enable email confirmation in production** to prevent spam accounts and ensure real email ownership.
2. **Set strong password policies** in Supabase Dashboard: minimum 8 characters, require mixed case and numbers.
3. **Use MFA for admin accounts** — any user with `organization_admin` role or higher should have MFA enabled.
4. **Configure custom SMTP** — Supabase's built-in email has sending limits. Use a custom SMTP provider for reliable delivery.
5. **Set up redirect URLs immediately** — forgetting to configure redirect URLs in Supabase Dashboard is the most common cause of broken auth flows.
6. **Test the full password reset flow** before going live — verify the email arrives, the link works, and the new password allows login.
7. **Monitor failed login attempts** through the audit log to detect brute-force attacks.
8. **Use a strong service role key** — the service role key should be a complex random string stored only in environment variables.
9. **Never log credentials** — ensure application logs never contain passwords, reset tokens, or session tokens.
10. **Rotate service role keys periodically** — regenerate the service role key in Supabase Dashboard every 90 days.
11. **Configure CORS properly** — restrict allowed origins to your application domain only.
12. **Use PKCE flow for mobile** — the PKCE (Proof Key for Code Exchange) flow is more secure for mobile/PWA apps.
13. **Set appropriate session durations** — 1 hour default is suitable for most cases; extend for judging sessions that may span longer.
14. **Implement session refresh** — the middleware automatically refreshes sessions; ensure it's working correctly.
15. **Test with incognito mode** — always test auth flows in private/incognito browser windows to avoid cached state.

---

# Section 29: Common Mistakes

1. **Forgetting to set NEXT_PUBLIC_APP_URL** — password reset emails link to `undefined/auth/callback` instead of the actual domain.
2. **Using service role key client-side** — exposes the key in browser code, creating a critical security vulnerability.
3. **Not configuring Supabase Site URL** — OAuth callbacks redirect to localhost instead of the production domain.
4. **Setting wrong redirect URIs** — OAuth providers reject callbacks if the redirect URI doesn't match exactly.
5. **Disabling email confirmation in production** — allows anyone to create accounts without email verification.
6. **Not checking CORS settings** — API requests from the frontend domain are blocked by the browser.
7. **Using the anon key for privileged operations** — the anon key is subject to RLS; operations requiring elevated permissions need the service role key.
8. **Not handling session expiry gracefully** — users receive confusing errors instead of being redirected to login.
9. **Storing session tokens in localStorage** — vulnerable to XSS attacks. FestPro uses HTTP-only cookies correctly.
10. **Ignoring rate limit errors** — "Email rate limit exceeded" means wait, not keep retrying.
11. **Creating duplicate profile inserts** — the trigger already creates profiles; app code should not insert again.
12. **Not wrapping useSearchParams in Suspense** — Next.js 16 requires Suspense boundary for client components using useSearchParams.
13. **Having route.ts and page.tsx in the same directory** — causes build conflict in Next.js.
14. **Not verifying the middleware handles auth routes** — missing routes in the publicRoutes array cause redirect loops.
15. **Using incorrect enum values in signup** — the trigger inserts 'organization_owner' role; the enum must contain this value.
16. **Setting passwords that don't meet policy** — validate against Supabase Auth password policy, not just minimum length.
17. **Not configuring MFA recovery codes** — users locked out of MFA cannot access their account without recovery codes.
18. **Deleting users instead of deactivating** — deletion removes all historical audit data tied to that user.
19. **Not testing email deliverability** — emails land in spam if SPF/DKIM records are not configured for the sending domain.
20. **Overlooking middleware matcher config** — missing route patterns in the matcher cause auth bypasses for those routes.

---

# Section 30: Troubleshooting

## 30.1 Login Fails

**Problem:** User enters correct credentials but receives "Invalid login credentials".
**Reasons:**
- Email not confirmed (if email confirmation enabled)
- Account locked due to multiple failed attempts
- Incorrect password (user forgot)
- Account disabled by admin

**Solutions:**
1. Check if email confirmation is required: try a different account or ask admin to confirm via Supabase Dashboard.
2. Wait 15 minutes if account is locked.
3. Use "Forgot Password" to reset credentials.
4. Contact admin to verify account status in Supabase Dashboard → Authentication → Users.

## 30.2 Signup Fails with "User already registered"

**Problem:** Email already exists in the system.
**Reason:** User previously registered with the same email.
**Solutions:**
1. Use "Forgot Password" to regain access to the existing account.
2. Login with the existing account instead of creating a new one.
3. If the email was used by someone else, contact support.

## 30.3 Password Reset Email Not Received

**Problem:** User requests reset but no email arrives.
**Reasons:**
- Email landed in spam/junk folder
- Wrong email entered
- Rate limit exceeded (max 3/hour)
- SMTP configuration issue
- Email bounced (invalid address)

**Solutions:**
1. Check spam/junk folder thoroughly.
2. Verify the email was entered correctly.
3. Wait 60 minutes for rate limit to reset.
4. Contact admin to check Supabase Auth logs for email send status.
5. Admin can manually trigger a reset from Supabase Dashboard.

## 30.4 "Email rate limit exceeded"

**Problem:** Cannot send verification or reset emails.
**Reason:** Supabase enforces rate limits on auth emails (approximately 10 per hour per email).
**Solutions:**
1. Wait 1 hour before trying again.
2. Admin can temporarily disable email confirmation in Supabase Dashboard → Authentication → Providers → Email.
3. Configure custom SMTP for higher sending limits.

## 30.5 Session Expires Immediately

**Problem:** User logs in but is redirected back to login immediately.
**Reasons:**
- Session cookie not persisted by browser
- Middleware misconfiguration
- Cookie domain mismatch (e.g., cookie set on www.example.com but used on example.com)
- Cookie blocking by browser extension

**Solutions:**
1. Clear browser cookies for the domain.
2. Test in incognito/private mode.
3. Check middleware.ts for correct cookie handling.
4. Disable browser extensions that block cookies.
5. Ensure the domain/subdomain is consistent.

## 30.6 "Conflicting route and page" Build Error

**Problem:** Vercel deployment fails with "Conflicting route and page at /callback".
**Reason:** Both `route.ts` (API handler) and `page.tsx` (page component) exist in the same directory.
**Solution:** Remove one. Use `page.tsx` for client-rendered pages; use `route.ts` for API-only endpoints.

## 30.7 "useSearchParams should be wrapped in Suspense" Build Error

**Problem:** Next.js build fails with Suspense boundary error.
**Reason:** Next.js 16 requires that components using `useSearchParams()` be wrapped in a `<Suspense>` boundary.
**Solutions:**
1. Wrap the component in `<Suspense>` with a fallback loader.
2. Extract the search params component into a separate child component that can be wrapped.
3. Alternatively, use `window.location.search` to avoid the hook entirely.

## 30.8 "Permission denied for table profiles" During Signup

**Problem:** Signup fails with database permission error.
**Reasons:**
- Admin client fell back to anon key (service role key not configured)
- RLS policy missing for INSERT on profiles
- Trigger `on_auth_user_created` not installed

**Solutions:**
1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables.
2. Verify the trigger exists: `SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')`.
3. The trigger is SECURITY DEFINER and bypasses RLS; if it's present, the profile insert should work.

## 30.9 "Invalid API Key" Error

**Problem:** Application shows "invalid api key" error.
**Reasons:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is incorrect or missing
- Supabase project ID is incorrect
- Environment variables not set in Vercel (only in .env.local)

**Solutions:**
1. Verify the anon key in Supabase Dashboard → Settings → API → Project API keys.
2. Copy the `anon public` key to Vercel environment variables.
3. Redeploy after setting environment variables.

## 30.10 OAuth Login Fails

**Problem:** "Sign in with Google/GitHub" returns error.
**Reasons:**
- OAuth provider not enabled in Supabase Dashboard
- Redirect URI mismatch
- OAuth app not configured in provider's developer console
- State parameter mismatch (PKCE flow issue)

**Solutions:**
1. Enable the provider in Supabase Dashboard → Authentication → Providers.
2. Verify the redirect URI: `https://[project-ref].supabase.co/auth/v1/callback`.
3. Ensure this exact URI is configured in the OAuth provider's developer console.
4. Clear browser cache and retry.

---

# Section 31: FAQ

**Q1: How do I create an account?**  
Go to `/signup`, fill in your name, email, and password. Verify your email if prompted.

**Q2: I forgot my password. What do I do?**  
Click "Forgot Password" on the login page. Enter your email. Click the reset link sent to your email.

**Q3: How long is my session valid?**  
Sessions expire after 1 hour of inactivity. The "Remember me" option extends this to 30 days.

**Q4: Can I stay logged in?**  
Yes, check "Remember me" on login. Your session will persist across browser closes for 30 days.

**Q5: Why am I getting "Invalid login credentials"?**  
Either your email or password is incorrect, your email is not verified, or your account is locked.

**Q6: How many times can I try to login?**  
10 failed attempts per minute per IP. After 20 total failures, your account locks for 15 minutes.

**Q7: Can I use the same email for multiple accounts?**  
No. Each email can only have one account. You can join multiple organizations from one account.

**Q8: How do I log out?**  
Click your profile icon in the top navigation → "Sign Out".

**Q9: What happens if I close my browser without logging out?**  
Your session remains active until it expires (1 hour default, 30 days with Remember me).

**Q10: Can I use my Google account to login?**  
If the admin has enabled Google OAuth, you can use "Sign in with Google".

**Q11: Is two-factor authentication available?**  
Yes. Go to Profile → Security → Enable MFA. Use any authenticator app.

**Q12: How do I recover my account if I lose my MFA device?**  
Use one of your 10 recovery codes provided during MFA setup. Contact admin if all are used.

**Q13: How do I change my email address?**  
Contact your organization admin. Email changes require admin intervention.

**Q14: How do I change my name?**  
Go to Profile → Edit Profile. First name and last name are editable.

**Q15: Why do I need to verify my email?**  
To prove you own the email address and prevent automated account creation.

**Q16: I didn't receive the verification email. What now?**  
Check spam. If not there, try resending from the login page. If still not received, contact support.

**Q17: Can I use the platform without JavaScript?**  
No. The platform requires JavaScript for authentication and all interactions.

**Q18: Is my password visible to anyone?**  
No. Passwords are hashed with bcrypt. Not even system administrators can see your password.

**Q19: Can I use a password manager?**  
Yes. The sign-in and sign-up forms are compatible with all major password managers.

**Q20: What happens if my session expires while I'm filling a form?**  
Your data may be lost. Save frequently. On next login, you'll need to start over.

---

# Section 32: Glossary

| Term | Definition |
|------|------------|
| Authentication | The process of verifying a user's identity (who you are) |
| Authorization | The process of determining what an authenticated user can access (what you can do) |
| Session | A temporary, secure connection between a user's browser and the server |
| JWT | JSON Web Token — a compact, URL-safe token format used for session data |
| MFA | Multi-Factor Authentication — requiring two or more verification methods |
| TOTP | Time-based One-Time Password — a 6-digit code that changes every 30 seconds |
| PKCE | Proof Key for Code Exchange — a secure OAuth flow for mobile/public clients |
| bcrypt | A password-hashing function designed to be computationally expensive |
| RLS | Row-Level Security — PostgreSQL feature that restricts row access based on user |
| SSO | Single Sign-On — authentication system that allows one set of credentials for multiple apps |
| OAuth | Open standard for token-based authentication and authorization |
| Rate Limiting | Controlling the number of requests a user can make in a given time period |
| Salt | Random data added to a password before hashing to prevent rainbow table attacks |
| Session Cookie | An HTTP cookie that stores session identifier, marked HttpOnly and Secure |

---

# Section 33: Keyboard Shortcuts

No keyboard shortcuts are available on authentication pages.

---

# Section 34: Performance Tips

1. **Session lookups are fast** — Supabase stores sessions in-memory, so middleware checks are sub-millisecond.
2. **Rate limiting is per-IP** — affects users behind shared NAT; consider this when configuring limits.
3. **Bulk user imports should be batched** — importing 10,000+ users at once can timeout; batch in groups of 500.
4. **Session refresh is lazy** — the middleware only refreshes sessions when they are within 10% of expiry.
5. **Custom SMTP reduces latency** — Supabase's built-in email has queues; custom SMTP delivers faster.

---

# Section 35: Video Tutorial Placeholder

A video tutorial for the Authentication Module is available:  
`https://festpro.app/tutorials/authentication` (placeholder)

Topics covered:
- Creating an account (2 min)
- Login and session management (1 min)
- Password reset flow (3 min)
- Setting up MFA (2 min)
- Admin auth configuration (5 min)

---

# Section 36: Screenshot Placeholder

Screenshots are available in the `docs/screenshots/auth/` directory:

| Screenshot | File |
|------------|------|
| Login page | `login-page.png` |
| Signup page | `signup-page.png` |
| Forgot password | `forgot-password.png` |
| Password reset form | `password-reset.png` |
| MFA setup | `mfa-setup.png` |
| Auth callback | `callback-page.png` |

---

# Section 37: Related Articles

- **Organization Management** (02_ORGANIZATION.md) — creating and managing your organization after login
- **Team & Roles** (03_TEAM_ROLES.md) — inviting team members, assigning roles
- **Security Model** (22_SECURITY.md) — RLS, encryption, compliance
- **API Reference** (20_API.md) — programmatic authentication

---

# Section 38: Learning Path

## Authentication Learning Sequence

1. **Start Here** — Create your account and log in (this document, Sections 7.1–7.2)
2. **Password Management** — Learn password reset flow (this document, Section 7.3)
3. **Security Hardening** — Enable MFA (this document, Section 7.4)
4. **Organization Setup** — Read Organization Management → create your organization
5. **Team Building** — Read Team & Roles → invite your first team member
6. **Platform Administration** — Read Security Model → configure auth policies
7. **Advanced** — Read API Reference → programmatic auth for integrations

---

# Section 39: Advanced Configuration

## 39.1 Custom JWT Expiry

Session duration is configurable in Supabase Dashboard:
- **Supabase Dashboard → Authentication → Settings → Session duration**
- Default: 3600 seconds (1 hour)
- Range: 60–604800 seconds (1 minute to 7 days)

## 39.2 Custom Password Policy

Password policy is configurable in Supabase Dashboard:
- **Supabase Dashboard → Authentication → Settings → Password policy**
- Minimum length (default: 6)
- Require uppercase
- Require lowercase
- Require digit
- Require special character

## 39.3 Custom SMTP Configuration

For reliable email delivery, configure custom SMTP:
1. **Supabase Dashboard → Authentication → Settings → SMTP Settings**
2. Provider options: SendGrid, Resend, AWS SES, Mailgun, custom SMTP
3. Required fields: Host, Port, Username, Password, Sender email, Sender name

## 39.4 Multi-Organization SSO

Configure SAML 2.0 SSO for organization-specific authentication:
1. **Supabase Dashboard → Authentication → SSO → Add Provider**
2. Upload SAML metadata XML
3. Map attributes (email, name) to Supabase user fields
4. Configure domain-based auto-provisioning

---

# Section 40: Administrator Notes

## 40.1 Environment Variables for Authentication

Ensure these variables are set in all deployment environments:

```bash
# Required for auth to function
NEXT_PUBLIC_SUPABASE_URL=https://dshjkprpijoatritpyzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxx

# Required for email redirects
NEXT_PUBLIC_APP_URL=https://festpro-alpha.vercel.app
```

## 40.2 Supabase Dashboard Configuration Checklist

| Setting | Location | Recommended Value |
|---------|----------|------------------|
| Site URL | Auth → Settings → Site URL | `https://festpro-alpha.vercel.app` |
| Redirect URLs | Auth → Settings → Redirect URLs | `https://festpro-alpha.vercel.app/auth/callback` |
| Session duration | Auth → Settings | 3600 (1 hour) |
| Email confirmation | Auth → Providers → Email | ON (production) |
| SMTP | Auth → Settings → SMTP | Configured with custom provider |
| CORS | Project Settings → API → CORS | Frontend domain(s) |

## 40.3 Monitoring Auth Health

| Metric | Where to Check | Warning Threshold | Critical Threshold |
|--------|---------------|:-----------------:|:------------------:|
| Login success rate | Supabase Dashboard → Auth → Logs | < 80% | < 50% |
| Failed attempts/IP | Custom monitoring | > 50/hour | > 200/hour |
| Email send failures | SMTP provider dashboard | > 5% | > 20% |
| Active users | Supabase Dashboard → Auth → Users | N/A | N/A |

---

*End of Authentication Module Documentation*
