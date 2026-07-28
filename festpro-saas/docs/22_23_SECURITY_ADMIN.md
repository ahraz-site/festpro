# FestPro Security & Administration — Complete Official Documentation

**Module:** 22 — Security Model, 23 — Audit & Administration  
**Version:** 2.0  
**Dependencies:** All modules  
**Applies To:** Platform Owners, Organization Admins, Security Teams

---

# Section 1: Introduction

FestPro employs a defense-in-depth security strategy across four layers — network, authentication, authorization, and audit. This document covers the complete security model, Row-Level Security (RLS) implementation, encryption standards, audit logging, and administrative functions for platform and organization management.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                            │
│                                                             │
│  Layer 1: NETWORK                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ HTTPS (TLS 1.3)   CORS    WAF      DDoS Protection   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 2: AUTHENTICATION                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Supabase Auth    JWT    MFA (TOTP)    OAuth (Google)  │  │
│  │ Password Policy  Session Mgmt    Magic Link           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 3: AUTHORIZATION                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Row-Level Security (RLS)    Role-Based Access (RBAC)  │  │
│  │ 13 predefined roles    37 permission categories       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 4: AUDIT                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Activity Log    Audit Trail    Change Tracking        │  │
│  │ 20+ event categories    Immutable records            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

# Section 2: Network Security

| Measure | Implementation | Description |
|---------|---------------|-------------|
| HTTPS | TLS 1.3 enforced | All traffic encrypted in transit |
| HSTS | Strict-Transport-Security header | Forces HTTPS for all subdomains |
| CORS | Whitelist-based origin validation | Only trusted domains allowed |
| WAF | Web Application Firewall (Vercel) | Blocks SQL injection, XSS, CSRF |
| Rate Limiting | 100 req/min per IP | Prevents brute force and DDoS |
| DDoS Protection | Vercel Edge Network | Automatic mitigation |

---

# Section 3: Authentication

## 3.1 Auth Methods

| Method | Status | Description |
|--------|:------:|-------------|
| Email + Password | ✅ | Standard login with bcrypt-hashed passwords |
| Google OAuth | ✅ | Single sign-on with Google |
| Magic Link | ✅ | Passwordless email login |
| MFA (TOTP) | ✅ | Time-based one-time password via authenticator app |
| MFA (Phone) | ✅ | SMS-based verification code |
| Biometric (PWA) | ✅ | WebAuthn fingerprint/face login |

## 3.2 Password Policy

| Rule | Requirement |
|------|-------------|
| Minimum Length | 8 characters |
| Complexity | At least 1 uppercase, 1 lowercase, 1 number |
| Max Failed Attempts | 5 before temporary lockout (15 min) |
| Session Duration | 24 hours (7 days with "Remember Me") |
| Password History | Cannot reuse last 5 passwords |
| Force Reset Interval | 90 days (configurable for organizations) |

## 3.3 Session Management

| Property | Value |
|----------|-------|
| Token Type | JWT (JSON Web Token) |
| Token Expiry | 1 hour (refreshed automatically) |
| Refresh Token Expiry | 24 hours (or 7 days with remember me) |
| Storage | HTTP-only cookie (server) / memory (client) |
| Invalidation | On password change, logout, admin force-logout |

---

# Section 4: Authorization

## 4.1 Role Hierarchy

```
PLATFORM_OWNER (system superadmin)
└── PLATFORM_ADMIN
    └── ORGANIZATION_OWNER
        └── ORGANIZATION_ADMIN
            └── FESTIVAL_DIRECTOR
                └── MANAGER
                    ├── STAFF
                    ├── JUDGE
                    ├── FINANCE
                    ├── MEDIA
                    ├── RECEPTION
                    └── VOLUNTEER
                        └── PARTICIPANT
```

Each role inherits permissions from all roles below it.

## 4.2 Permission Categories (37 granular permissions)

| Category | Permissions |
|----------|-------------|
| **Festival** | `fest.create`, `fest.read`, `fest.update`, `fest.delete`, `fest.publish` |
| **Competition** | `comp.create`, `comp.read`, `comp.update`, `comp.delete` |
| **Participant** | `part.create`, `part.read`, `part.update`, `part.delete`, `part.approve` |
| **Registration** | `reg.create`, `reg.read`, `reg.update`, `reg.delete`, `reg.checkin` |
| **Schedule** | `sched.create`, `sched.read`, `sched.update`, `sched.delete`, `sched.manage_live` |
| **Judging** | `judge.assign`, `score.enter`, `score.view`, `score.lock`, `score.approve` |
| **Finance** | `fin.create`, `fin.read`, `fin.update`, `fin.delete` |
| **Report** | `report.create`, `report.read`, `report.export` |
| **Settings** | `settings.read`, `settings.update` |
| **Users** | `user.invite`, `user.manage`, `user.suspend` |
| **Admin** | `admin.access`, `admin.audit` |

---

# Section 5: Row-Level Security (RLS)

## 5.1 RLS Policy Patterns

Every table has RLS enabled. Below are the key policy implementations:

### Organization-level access (applied to festivals, competitions, etc.)

```sql
CREATE POLICY "org_member_access" ON festivals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));
```

### Self-access (profiles)

```sql
CREATE POLICY "users_read_own" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Platform admin access (bypasses org restrictions)

```sql
CREATE POLICY "admin_full_access" ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('platform_owner', 'platform_admin')
    )
  );
```

### Judge-scoped access (scores)

```sql
CREATE POLICY "judge_own_scores" ON scores FOR ALL
  USING (judge_id = auth.uid());
```

## 5.2 Storage RLS

Storage buckets also have RLS:

```sql
CREATE POLICY "org_storage_access" ON storage.objects FOR ALL
  USING (
    bucket_id LIKE 'festival-media%'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

# Section 6: Data Encryption

| Data State | Standard | Implementation |
|------------|----------|---------------|
| **At Rest (Database)** | AES-256 | PostgreSQL transparent data encryption (Supabase) |
| **At Rest (Files)** | AES-256 | S3 server-side encryption (Supabase Storage) |
| **In Transit** | TLS 1.3 | HTTPS for all API and web traffic |
| **Passwords** | bcrypt | Salted hash, cost factor 12 |
| **API Keys** | bcrypt | Hashed before storage, never stored in plaintext |
| **JWT Tokens** | RS256 | Signed with private key, verified with public key |
| **Environment Vars** | AES-256 | Vercel environment encryption |

---

# Section 7: Audit Log

## 7.1 Event Categories

| Category | Events Logged |
|----------|---------------|
| **Authentication** | Login, logout, password reset, MFA enable/disable, MFA verify, account lockout |
| **Organization** | Create, update, delete, transfer ownership, settings change |
| **Team** | Invite sent, invite accepted, invite revoked, role change, member removed |
| **Festivals** | Create, update, publish, archive, cancel, status change |
| **Competitions** | Create, update, delete, category change, status change |
| **Registrations** | Create, approve, reject, cancel, check-in, bulk import |
| **Participants** | Create, update, merge, delete |
| **Judging** | Score submit, score update, score lock, score approve, judge assignment |
| **Results** | Calculate, publish, override, certificate generate |
| **Finance** | Payment receive, refund process, expense record, invoice generate, gateway sync |
| **Settings** | Fee configure, template change, integration config, role change |
| **Security** | Permission change, RLS policy change, API key generate/revoke |

## 7.2 Audit Log Entry Structure

```json
{
  "id": "a1b2c3d4-...",
  "organization_id": "org-uuid",
  "user_id": "user-uuid",
  "action": "registration.confirmed",
  "entity_type": "registrations",
  "entity_id": "reg-uuid",
  "old_values": {
    "status": "pending"
  },
  "new_values": {
    "status": "confirmed",
    "confirmed_by": "user-uuid"
  },
  "ip_address": "203.0.113.1",
  "user_agent": "Mozilla/5.0 ...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

## 7.3 Audit Features

| Feature | Description |
|---------|-------------|
| **Immutable** | Audit records cannot be deleted or modified |
| **Timestamped** | All entries have precise UTC timestamps |
| **User-attributed** | Every entry linked to the acting user |
| **Searchable** | Filter by date, user, action, entity type |
| **Exportable** | Download as CSV or JSON for compliance |
| **Retention** | 7 years minimum (configurable) |

---

# Section 8: Administrative Functions

## 8.1 Platform Administration

| Function | Description | Access |
|----------|-------------|--------|
| **Platform Dashboard** | Overview of all organizations, system health, usage metrics | Platform Owner/Admin |
| **User Management** | View, suspend, activate, delete users across all orgs | Platform Owner/Admin |
| **Organization Admin** | View all orgs, force settings, transfer ownership | Platform Owner/Admin |
| **System Monitoring** | Performance metrics, error logs, uptime monitoring | Platform Owner/Admin |
| **Migration Management** | Database schema migrations, version control | Platform Owner |
| **Environment Config** | Environment variables, feature flags, secrets | Platform Owner (Vercel) |
| **Rate Limit Config** | Adjust rate limits per endpoint or organization | Platform Admin+ |

## 8.2 Organization Administration

| Function | Description | Access |
|----------|-------------|--------|
| **Member Management** | Invite, remove, change roles | Org Admin+ |
| **Billing & Subscription** | View plan, upgrade, payment history | Org Owner |
| **Branding** | Logo, colors, custom domain configuration | Org Admin+ |
| **Audit Log** | View organization audit trail | Org Admin+ |
| **Data Export** | Export all organization data | Org Owner |
| **Settings** | Organization-wide settings and defaults | Org Admin+ |
| **Notification Templates** | Manage org-level notification templates | Org Admin+ |

## 8.3 Security Administration

| Function | Description | Access |
|----------|-------------|--------|
| **MFA Enforcement** | Require MFA for all members | Org Admin+ |
| **Password Policy** | Set org-specific password requirements | Org Admin+ |
| **Session Timeout** | Configure session duration | Org Admin+ |
| **IP Whitelist** | Restrict access to specific IP ranges | Org Admin+ |
| **API Key Management** | Generate, revoke, rotate API keys | Org Admin+ |
| **Webhook Management** | Configure and test webhook endpoints | Org Admin+ |
| **Data Retention** | Set data retention and archival policies | Org Owner |

---

# Section 9: Best Practices

1. **Enable MFA for all admin accounts** — protects against credential theft
2. **Rotate service role keys every 90 days** — limits exposure if key is compromised
3. **Review audit logs weekly** — detect unauthorised access attempts
4. **Use the principle of least privilege** — grant only the permissions needed
5. **Never expose service role keys** — server-side only, never in client code
6. **Configure CORS strictly** — limit allowed origins to trusted domains
7. **Set up database backups** — Supabase provides automated daily backups
8. **Monitor failed login attempts** — indicates brute-force attacks
9. **Keep environment variables secure** — use platform secrets management (Vercel)
10. **Regularly review organization members** — remove inactive or unnecessary accounts
11. **Enable audit logging for all sensitive operations** — complete accountability
12. **Use strong password policies** — enforce complexity and rotation
13. **Implement IP whitelisting for admin access** — restrict to organizational IPs
14. **Regularly test RLS policies** — ensure no unintended data exposure
15. **Have an incident response plan** — documented steps for security breaches

---

# Section 10: Common Mistakes

1. ❌ **Exposing service role key in client code** — can lead to complete data access
2. ❌ **Disabling RLS for performance** — breaks multi-tenant isolation
3. ❌ **Not rotating API keys** — compromised keys go undetected
4. ❌ **Overly permissive CORS** — allows any website to make API calls
5. ❌ **Ignoring audit logs** — security incidents go unnoticed
6. ❌ **Granting admin access unnecessarily** — increases attack surface
7. ❌ **Not reviewing member list** — former employees retain access
8. ❌ **Weak password policies** — brute force vulnerability
9. ❌ **Skipping MFA** — single point of failure for credential theft
10. ❌ **No backup testing** — backup may fail when needed most

---

# Section 11: Troubleshooting

## P1: "Permission denied for table X"
**Problem:** Database operation fails with RLS error.  
**Root Causes:** (1) User not in organization. (2) Role lacks permission. (3) Service role key not configured for server operations.  
**Solution:** Verify user is member of organization; check role permissions; ensure server action uses admin client for privileged operations.

## P2: Audit log not showing expected events
**Problem:** Recent actions not appearing in audit log.  
**Root Causes:** (1) Audit logging not implemented for that action. (2) Date filter applied. (3) Action was done by admin client (bypasses trigger).  
**Solution:** Check audit log configuration; remove date filters; verify action is in the logged categories list.

## P3: Cannot access admin functions
**Problem:** Admin dashboard shows "Access denied."  
**Root Causes:** (1) User does not have platform role. (2) Organization admin trying to access platform-level functions.  
**Solution:** Verify user role in profiles table. Platform roles assigned by system bootstrap only.

## P4: Data export missing records
**Problem:** Exported CSV missing some data rows.  
**Root Causes:** (1) RLS filters applied (user sees only their data). (2) Date range filter active. (3) Export size limit reached.  
**Solution:** Use admin client (service role) for complete exports; remove filters; paginate large exports.

## P5: MFA setup failing
**Problem:** Cannot enable MFA on account.  
**Root Causes:** (1) Authenticator app time out of sync. (2) Browser not supported. (3) Already enabled.  
**Solution:** Sync device time; use a supported browser; disable and re-enable MFA.

---

# Section 12: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **How are passwords stored?** | Passwords are hashed with bcrypt (cost factor 12). Never stored in plaintext. |
| 2 | **What happens if I forget my password?** | Use the "Forgot Password" link. A password reset email is sent to your verified email. |
| 3 | **Can I force all users to enable MFA?** | Yes. Organization Admins can enforce MFA in Security Settings. |
| 4 | **How long are audit logs retained?** | Minimum 7 years by default. Configurable in Data Retention settings. |
| 5 | **Can I export the entire audit log?** | Yes. Filter by date range and export as CSV or JSON. |
| 6 | **What is the difference between Platform Admin and Org Admin?** | Platform Admin manages all organizations system-wide. Org Admin manages a single organization. |
| 7 | **How do I revoke a user's access?** | Remove them from the organization in Team Management. Their session is invalidated. |
| 8 | **Is data encrypted at rest?** | Yes. AES-256 encryption for database and file storage. |
| 9 | **Can I restrict access by IP?** | Yes. Organization Admins can configure IP whitelists. |
| 10 | **How do I rotate API keys?** | Settings → API → Regenerate Key. Old key is immediately invalidated. |

---

# Section 13: Glossary

| Term | Definition |
|------|------------|
| **RLS** | Row-Level Security — PostgreSQL feature restricting data access at the row level |
| **RBAC** | Role-Based Access Control — permissions assigned based on user role |
| **MFA** | Multi-Factor Authentication — additional verification beyond password |
| **JWT** | JSON Web Token — compact, URL-safe token for authentication |
| **TLS** | Transport Layer Security — cryptographic protocol for secure communication |
| **CORS** | Cross-Origin Resource Sharing — browser security mechanism |
| **bcrypt** | Password hashing function with adaptive cost factor |
| **Audit Trail** | Chronological record of all system activities |
| **Service Role Key** | Supabase key with full database access (server-only) |

---

*End of Security & Administration Module Documentation (Modules 22-23)*
