# Digital Clinic Application Architecture

## Architectural Vision

The Digital Clinic App ("Nurses & Doctors on Your Phone") is a high-availability, modular full-stack healthcare application designed to streamline patient intake, eliminate physical waiting congestion, support household proxy care for elderly/vulnerable family members, and orchestrate real-time workflows between Reception Clerks, Doctors/Nurses, and Pharmacists.

---

## Technical Stack Summary

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Animations), Lucide Icons.
- **Database & Persistence**: Firebase Firestore (Real-time snapshot listeners, structural collections) with reactive local storage fallback for offline/preview resilience.
- **Authentication**: Firebase Authentication with RBAC role context (`patient`, `clerk`, `doctor`, `pharmacist`, `admin`).
- **Security**: Firestore Security Rules v2 enforcing Schema Validation, ID Poisoning Guards, and Terminal State Locks (`firestore.rules`).
- **Real-Time Push Notifications**: Firebase Cloud Messaging (FCM Background Service Worker in `/public/firebase-messaging-sw.js`).
- **CI/CD Pipeline**: GitHub Actions workflow deployment targeting Firebase Hosting (`.github/workflows/deploy.yml`).
- **Testing**: Vitest for unit/integration testing + Playwright for End-to-End browser automation.
- **Telemetry**: Sentry error tracking & Firebase Analytics event tracking wrapper (`/src/services/telemetry.ts`).

---

## Firestore Data Blueprint (`firebase-blueprint.json`)

```
/users/{userId}                              -> User profiles & roles
/users/{userId}/householdProxies/{proxyId}   -> Elderly & child dependent proxy profiles
/clinics/{clinicId}                         -> Healthcare facility records
/appointments/{appointmentId}               -> Scheduled patient consultations
/queues/{queueId}                           -> Live real-time patient queue tickets
/medication_requests/{requestId}            -> Chronic refills & prescription collection orders
/notifications/{notificationId}             -> Real-time user alert records
```

---

## Live Queue State Machine

```
[ Checked In ]  --->  [ At Vitals ]  --->  [ At Consult ]  --->  [ At Pharmacy ]  --->  [ Completed ]
 (Intake Clerk)        (Triage Nurse)       (Doctor / Nurse)     (Pharmacist)          (Discharged)
```

1. **Checked In**: Patient checks in online or via reception kiosk / manual paper override. Ticket generated (`A-101`).
2. **At Vitals**: Nurse records Blood Pressure, Pulse, Temperature, SpO2, and Blood Glucose. Abnormal vitals flag automatic warnings.
3. **At Consult**: Doctor performs exam, records clinical diagnosis, writes prescription, and routes to Pharmacy or Discharge.
4. **At Pharmacy**: Pharmacist pre-packs batch medications, assigns to Smart Locker or Counter Window, and marks ready.
5. **Completed**: Patient collects medication or is discharged. Ticket closed.

---

## Local Setup & Deployment Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Test Suite**:
   ```bash
   npm run test
   ```

4. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```
