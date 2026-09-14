# Security Specification & Threat Model (`security_spec.md`)

## System Architecture & RBAC Matrix

The Digital Clinic App enforces strict Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC) across 5 primary roles:
1. **Patient**: Community member or primary household holder. Can book appointments, manage proxies, view active queue position, and view medication pickup status.
2. **Clerk**: Clinic administration staff. Manages patient intake lists, queue status transitions (Checked In -> At Vitals -> etc.), and paperwork overrides.
3. **Doctor / Nurse**: Clinical healthcare workers. Accesses patient consult queues, updates vital signs, records diagnosis notes, and routes patients to pharmacy or discharge.
4. **Pharmacist**: Pharmacy staff. Manages chronic medication prep batches, views prescription requests, and marks items ready for counter/locker collection.
5. **Admin**: System administrator. Has full operational management rights across clinics, staff assignments, and audit logs.

---

## Data Invariants & Security Pillars

1. **Identity & Ownership Integrity**:
   - `patientId` or `userId` in created documents MUST strictly match `request.auth.uid` (or a verified proxy linked to `request.auth.uid`).
   - Users CANNOT alter their own assigned `role` field.
2. **Terminal State Locking**:
   - Completed queue tickets (`stage: 'Completed'`) or collected prescriptions (`status: 'collected'`) cannot be modified by non-admin users.
3. **Temporal Integrity**:
   - `createdAt` must be server timestamp (`request.time`).
   - `updatedAt` on modifications must be server timestamp (`request.time`).
4. **Data Sanitization & Limits**:
   - String sizes are capped (e.g. `fullName <= 100`, `reason <= 500`).
   - Valid string format regex checks on IDs (`^[a-zA-Z0-9_\\-]+$`).

---

## The "Dirty Dozen" Vulnerability Payloads (TDD Test Suite)

1. **Unverified Role Escalation**: Patient attempts to update `role: "doctor"` in `/users/{uid}`. -> **REJECTED**
2. **Orphan Queue Ticket**: Non-staff patient creates arbitrary queue ticket assigned to another user's ID. -> **REJECTED**
3. **Queue Stage Jumping**: Non-staff user updates queue stage directly from `Checked In` to `Completed`. -> **REJECTED**
4. **PII Data Harvest**: Unauthenticated user attempts `list` query on `/users`. -> **REJECTED**
5. **Medication Prescription Tampering**: Patient attempts to modify prescribed medication list or mark `status: "ready_for_pickup"`. -> **REJECTED**
6. **Cross-Tenant Queue Reading**: Patient reads queue tickets belonging to unrelated patients. -> **REJECTED**
7. **Proxy Hijacking**: User A attempts to add household proxy under User B's `primaryUserId`. -> **REJECTED**
8. **Junk ID Denial-of-Wallet Attack**: Attacker injects 2MB string as document key. -> **REJECTED**
9. **Timestamp Forgery**: Attacker sends future date for `createdAt` timestamp. -> **REJECTED**
10. **Re-opening Completed Ticket**: Staff attempts to edit completed historic queue item without admin override. -> **REJECTED**
11. **Spoofed Email Access**: User sets email to `doctor@clinic.gov` with `email_verified == false`. -> **REJECTED**
12. **Shadow Field Injection**: Payload contains undocumented `isSystemAdmin: true` flag. -> **REJECTED**

---

## Validation Logic Test Plan

All 12 vulnerability scenarios are validated against `firestore.rules` using the global primitive helpers and `isValid[Entity]()` guards.
