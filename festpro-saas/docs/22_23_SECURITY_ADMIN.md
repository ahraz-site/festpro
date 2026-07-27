# FestPro Security & Administration — Complete Official Documentation

**Module:** Security, Audit & Administration  
**Version:** 1.0  
**Dependencies:** All modules  
**Applies To:** Platform Owners, Organization Admins

---

# Section 1: Introduction

## 1.1 Security Model

FestPro employs a defense-in-depth security strategy with four layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| Network | HTTPS (TLS 1.3), CORS, WAF | Secure transport, origin validation |
| Authentication | Supabase Auth, JWT, MFA | Identity verification |
| Authorization | Row-Level Security (RLS) + App-level RBAC | Access control |
| Audit | Activity log, audit trail | Accountability |

## 1.2 Row-Level Security (RLS)

Every table in FestPro has RLS enabled. PostgreSQL policies enforce that:

- Users can only access data for organizations they belong to
- Within an organization, access is further restricted by role
- Platform-level roles (platform_owner, platform_admin) can access all data
- Storage objects are protected by bucket-level policies

### Example RLS Implementation

The following policies exist on key tables:

**profiles table:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**organizations table:**
```sql
-- Organization members can read their organizations
CREATE POLICY "Members can read their organizations"
  ON organizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id
    AND user_id = auth.uid()
  ));
```

**festivals table:**
```sql
-- Organization members can read festivals
CREATE POLICY "Members can read festivals"
  ON festivals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = festivals.organization_id
    AND user_id = auth.uid()
  ));
```

## 1.3 Audit Log

Every significant action is logged:

| Event Category | Examples |
|---------------|----------|
| Authentication | Login, logout, password reset, MFA changes |
| Organization | Create, update, delete, transfer |
| Team | Invite, join, leave, role change, remove |
| Festivals | Create, publish, cancel, archive |
| Competitions | Create, update, status changes |
| Registrations | Register, approve, cancel, check-in |
| Judging | Score submit, finalize |
| Results | Approve, publish |
| Certificates | Generate, download, revoke |
| Finance | Payment, refund, expense |

### Audit Log Entry Structure

```
{
  "id": "uuid",
  "organization_id": "uuid",
  "user_id": "uuid",
  "action": "registration.confirmed",
  "entity_type": "registrations",
  "entity_id": "uuid",
  "old_values": { "status": "pending" },
  "new_values": { "status": "confirmed" },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 ...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

## 1.4 Data Encryption

| Data State | Encryption Standard |
|------------|-------------------|
| At rest (database) | AES-256 (PostgreSQL) |
| At rest (files) | AES-256 (S3 server-side) |
| In transit | TLS 1.3 |
| Environment variables | Platform-level encryption (Vercel) |

## 1.5 Administrator Functions

| Function | Description | Access |
|----------|-------------|--------|
| Platform dashboard | All organizations overview | Platform Owner/Admin |
| User management | View, suspend, delete users | Platform Owner/Admin |
| System monitoring | Performance, errors, uptime | Platform Owner/Admin |
| Migration management | Database schema updates | Platform Owner/Admin |
| Environment config | Environment variables | Platform Owner (Vercel) |

---

# Section 34: Troubleshooting

## P1: "Permission denied for table X"
**Problem:** Database operation fails with RLS error.
**Reasons:** User role does not have permission, RLS policy missing, service role key not configured.
**Solution:** Verify user has correct role. Check RLS policies on the table. Ensure service role key is configured for server operations.

## P2: Audit log not showing expected events
**Problem:** Recent actions not appearing in audit log.
**Reasons:** Audit logging not implemented for that action, or filter applied.
**Solution:** Check audit log configuration. Remove date filters. Verify action is in the logged categories.

## P3: Cannot access admin functions
**Problem:** Admin dashboard shows "Access denied."
**Reasons:** User does not have platform role (platform_owner or platform_admin).
**Solution:** Verify user role in profiles table. Platform roles are assigned by system bootstrap only.

## P4: Data export missing records
**Problem:** Exported CSV missing some data.
**Reasons:** RLS filters applied, date range filter active, or export limit reached.
**Solution:** Use admin client (service role) for complete exports. Remove filters. Check export size limits.

---

# Section 28: Best Practices

1. **Enable MFA for all admin accounts** — protects against credential theft.
2. **Rotate service role keys every 90 days** — limits exposure if key is compromised.
3. **Review audit logs weekly** — detect unauthorized access attempts.
4. **Use the principle of least privilege** — grant only the permissions needed.
5. **Never expose service role keys** — server-side only, never in client code.
6. **Configure CORS strictly** — limit allowed origins to trusted domains.
7. **Set up database backups** — Supabase provides automated backups.
8. **Monitor failed login attempts** — indicates brute-force attacks.
9. **Keep environment variables secure** — use platform secrets management.
10. **Regularly review organization members** — remove inactive or unnecessary accounts.

---

*End of Security & Administration Module Documentation*
