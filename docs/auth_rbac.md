# Authentication & Role-Based Access Control (RBAC) Documentation

## Overview

The Digital Clinic App implements a Zero-Trust Attribute-Based Access Control (ABAC) & Role-Based Access Control (RBAC) paradigm. Security is enforced synchronously at two levels:
1. **Application Layer (`/src/context/AuthContext.tsx`)**: Controls UI rendering, view routes, and action permissions according to the authenticated user's assigned role.
2. **Database Layer (`/firestore.rules`)**: Enforces non-bypassable backend constraints on all read/write operations against Firestore documents regardless of the client application SDK utilized.

---

## Supported User Roles

| Role Key | Display Name | Permissions Summary |
| :--- | :--- | :--- |
| `patient` | Patient / Community Member | Book appointments, view own active queue tickets, register elderly household dependents, request chronic refills. Cannot modify queue stages or view other patients' records. |
| `clerk` | Intake Administration Clerk | View scheduled intake rosters, check in patients, advance queue stages, issue digital override tickets for manual paperwork fallbacks. |
| `doctor` | Doctor / Clinical Nurse | View active consultation queue, record vital signs, record clinical diagnosis notes, prescribe medications, route patients to pharmacy or discharge. |
| `pharmacist` | Clinic Pharmacist | View chronic refill requests, batch pre-pack medications in advance, assign to Smart Lockers or Counter Windows, mark orders ready for collection, verify handover. |
| `admin` | System Administrator | Full cross-clinic governance rights, staff assignment management, audit log inspection, security overrides. |

---

## Authentication Flow

```
+------------------+         +-----------------------+         +-----------------------------+
| Client Application|  ---->  | Firebase Auth Google  |  ---->  | Firestore Document Lookup   |
| (React / Web)    |         | Sign-in Popup / Token |         | (/users/{uid}) -> UserRole  |
+------------------+         +-----------------------+         +-----------------------------+
                                                                             |
                                                                             v
                                                               +-----------------------------+
                                                               | Firestore Security Rules    |
                                                               | Validation via getUserRole()|
                                                               +-----------------------------+
```

1. **Identity Provider**: Google OAuth Authentication (`signInWithPopup`).
2. **Token Verification**: Firebase Auth verifies email ownership (`request.auth.token.email_verified == true`).
3. **Role Determination**: The security rules fetch the user's role from `/databases/$(database)/documents/users/$(request.auth.uid)`.
4. **Immutability Enforcement**: Users cannot update their own `role` property in their profile document (`incoming().role == existing().role`). Role changes require Admin privileges.

---

## Security Invariants

- **Master Gate Pattern**: Subcollections and related records require a `get()` call to verify parent ownership or staff membership.
- **Terminal State Lock**: Completed queue tickets (`stage: 'Completed'`) or collected medication orders (`status: 'collected'`) cannot be modified by non-admin users.
- **Temporal Server Timestamps**: All creation and update timestamps are strictly checked against `request.time`.
