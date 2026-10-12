# 🏥 Naimify Smart ICU & Critical Care Platform
## Comprehensive Technical & Architectural Documentation

---

## 📌 1. Executive Summary

**Naimify Smart ICU Platform** is an enterprise-grade, real-time critical care telemetry, remote patient monitoring (Tele-ICU), and clinical decision support system designed for multi-specialty intensive care networks. It bridges bedside medical devices (patient monitors, mechanical ventilators, infusion pumps) with multi-role hospital command centers, unifying patient trajectories, calculating automated acuity scores, and enforcing clinical governance across hospital networks.

The platform provides dedicated, role-tailored consoles for **Super Administrators (State Health Directorate)**, **Hospital Administrators**, **Chief Medical Directors**, **Lead Intensivists (Doctors)**, and **Critical Care Nurses (RNs)**.

---

## 🏗️ 2. Technology Stack & Architecture

### Core Frontend Stack
- **Framework**: React 18.3 (Strict Mode, Concurrent Features)
- **Language**: TypeScript 5.7 (Strict Type Checking, zero `any` tolerance in core business logic)
- **State Management**: Redux Toolkit 2.12 + React-Redux 9.3
- **Routing**: React Router DOM v6.28 (Role-based route guards, lazy-loaded route chunks)
- **Styling**: Tailwind CSS 3.4 + Custom Hospital Navy & Teal Design System (`#0F766E`, `#0D655E`, `#00A8A8`, `#10B981`)
- **Iconography**: Lucide React 0.469
- **Data Visualization**: Recharts 2.15 (Live 24h vitals, bed occupancy trends, SOFA vs mortality correlations)
- **Forms & Validation**: React Hook Form 7.88 + Custom RFC/Indian Standards Validation Engine
- **Motion & Micro-interactions**: Framer Motion 13.4
- **Build Tool**: Vite 6.0 (Optimized chunk splitting, asset pipeline, sub-7-second production bundle)
- **Testing Engine**: Vitest 5.0 (Unit and integration test suites)

### Architectural Paradigm
```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interfaces (UI Layer)                      │
│   Super Admin | Hospital Admin | Doctor Console | Nurse Console | Meet │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       State Management (Redux Store)                   │
│   authSlice | superAdminSlice | hospitalSlice | icuBedSlice | ...      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                     Services & Data Ingestion Engine                   │
│  AlertService | AuthService | WebSocketService | AssignmentService     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                  Telemetry Grid, Devices & REST / Mock                 │
│      Ventilators | Infusion Pumps | Multi-para Monitors | PTZ Video    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 3. User Roles & Access Control Hierarchy

| Role Code | Role Name | Primary Interface | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` | Statewide Health Directorate | `/admin/super-dashboard` | Hospital network node provisioning, statewide bed map, district telemetry oversight, doctor/nurse centralized roster, hospital remark auditing. |
| `ADMIN` | Hospital Operations Admin | `/admin` | Assigned command center, unit bed allocations (MICU/SICU/CCU/NICU), shift scheduling, clinical governance audits. |
| `DIRECTOR` | Chief Medical Director | `/admin/director` | Strategic clinical oversight, medical guidelines enforcement, read-only telemetry and operational statistics. |
| `DOCTOR` | Intensivist / Attending Physician | `/doctor` | Assigned patient telemetry, clinical notes entry, diagnostic reviews, SBAR shift handover, Tele-ICU video consultations. |
| `NURSE` | Critical Care Charge Nurse | `/nurse` | Continuous bedside monitoring, vitals entry, medication administration, fluid I/O balance, patient admission. |

---

## 🧭 4. Complete Application Route Map

### Public & Authentication
- `/` — Public Clinical Platform Landing Page with ECG wave hero animations, capabilities, and staff login portal.
- `/login` — Multi-role authenticated clinical gateway (Super Admin, Hospital Admin, Doctor, Nurse presets + work email SSO).
- `/meet` — Standalone high-definition Tele-ICU video consultation console (Google Meet / WebRTC bridge).

### Super Admin Governance (`/admin/*`)
- `/admin/super-dashboard` — Statewide telemetry hub, district hospital KPIs, live PTZ camera feeds, automated statewide reporting.
- `/admin/hospitals` — Statewide hospital network node registry, node code provisioning, director assignment.
- `/admin/district-management` — Bihar 38-district telemetry tracking and regional ICU resource allocation.
- `/admin/icu-overview` — Network-wide ICU bed capacity grid and real-time occupancy.
- `/admin/doctors` — Statewide intensivist registry with specialty, shift, and immutable remark history.
- `/admin/nurses` — Statewide nursing staff registry with assigned beds count and supervisor remark logs.
- `/admin/patients` — Centralized master patient index across all networked hospitals.
- `/admin/reports` — Executive healthcare reports with PDF and spreadsheet export capabilities.
- `/admin/audit-logs` — Immutable audit log trail covering authentication, bed allocation, and clinical modifications.

### Hospital Command Center (`/admin/*`)
- `/admin` or `/admin/hospital-overview` — Assigned hospital ICU command console (e.g., AIIMS Patna).
- `/admin/director` — Chief Medical Director operational profile and clinical restriction notice.
- `/admin/hospital-doctors` — Hospital doctor roster with specialty mapping.
- `/admin/hospital-nurses` — Hospital nursing shift assignments.
- `/admin/hospital-shifts` — Daily morning, evening, and night shift rota management.
- `/admin/hospital-icus` — Intensive Care Units (MICU-01, SICU-01, CCU-01, NICU-01).
- `/admin/bed-map` — Interactive 2D bed map with color-coded status badges (Occupied, Available, Reserved, Maintenance).
- `/admin/hospital-patients` — Real-time in-hospital patient census.
- `/admin/encounters` — Clinical encounter tracking and episode durations.
- `/admin/remarks` — Administrative operational remarks and audit preservation.
- `/admin/timeline` — Hospital timeline event stream.
- `/admin/custom-reports` — Custom date-range clinical and bed utilization reports.
- `/admin/activity-logs` — Security and access logs.

### Doctor Workflows (`/doctor/*`)
- `/doctor` — Doctor Overview Dashboard with clinical alerts, critical patient counter, and round scheduler.
- `/doctor/patients` — List of patients assigned directly to the attending doctor.
- `/doctor/bed-view` — Real-time multi-bed monitor view with animated ECG waveform and live telemetry readings.
- `/doctor/notes` — Clinical progression notes and diagnostic orders.
- `/doctor/history` — Longitudinal patient medical history, lab results, and imaging reports.
- `/doctor/reports` — Diagnostic round summaries and discharge summaries.
- `/doctor/profile` — Intensivist clinical profile, specialization, and hospital affiliation.
- `/doctor/meet` — Tele-ICU video conference room with instant meeting link generation and patient sharing.

### Nurse Workflows (`/nurse/*`)
- `/nurse` — Nurse Station Overview with active shift bed allocation and vital signs schedule.
- `/nurse/patients` — Assigned patient list with acuity status indicators.
- `/nurse/bed-monitoring` — Real-time continuous telemetry view for assigned beds.
- `/nurse/monitoring` — Vitals logging interface (HR, SpO2, NIBP, MAP, Respiratory Rate, Body Temp, GCS).
- `/nurse/notes` — Nursing shift notes, fluid intake/output balance (IV fluids, urine output), and pain score logging.
- `/nurse/add-patient` — Emergency patient admission and ICU bed allocation wizard.
- `/nurse/profile` — Registered Nurse profile and active shift assignment.

### Clinical Core & Governance
- `/handover` — Standardized clinical shift handover protocol (SBAR: Situation, Background, Assessment, Recommendation). Includes immutable remark preservation and append-only physician note history.
- `/patients` — Master Patient Registry with search, filter, and triage acuity sorting.
- `/icu-beds` — Universal bed monitoring grid with live telemetry dials.
- `/live-monitoring` — High-density live telemetry waveforms (Lead II ECG, Pleth, Arterial Line, Capnography).
- `/devices` — Biomedical device status and calibration monitoring (Dräger ventilators, Mindray monitors, B.Braun pumps).
- `/nursing` — Comprehensive digital nursing assessment flowsheet.
- `/alerts` — Active clinical alert center categorized by severity (Critical, Warning, Advisory).
- `/incidents` — Clinical incident management with severity scoring and CAPA action tracking.
- `/risks` — ICU risk matrix and infection control hazard mitigation.
- `/audits` — Hospital clinical quality audit checklists.
- `/actions` — Corrective and preventive actions (CAPA) tracking console.
- `/documents` — Hospital document vault with document upload and categorized browsing.
- `/analytics` — Clinical telemetry analytics, mortality prediction vs actual survival, and ventilator hours.
- `/virtual-icu` — Remote intensivist collaboration hub with PTZ camera remote controls.
- `/governance-360` — 360-degree regulatory compliance and quality metrics.
- `/patient/:patientId` — Patient 360° cockpit (Vitals trend, organ failure scores, ventilator mode, medication schedule).
- `/patient/:patientId/timeline` — Synchronized chronological event timeline with drilldown data provenance.

---

## 🔬 5. Key Clinical Features & Design Decisions

### 1. SBAR Clinical Shift Handover
- Implements the international healthcare **SBAR (Situation, Background, Assessment, Recommendation)** standard.
- **Append-Only Clinical Audit**: Notes entered by the handover doctor cannot be overwritten or deleted by incoming doctors. Incoming physicians can append timestamped follow-up remarks, preserving medicolegal integrity.

### 2. Multi-Bed Telemetry & Organ Dysfunction Scoring
- Integrates calculated severity scores:
  - **SOFA (Sequential Organ Failure Assessment)**: Assesses respiratory, cardiovascular, hepatic, coagulation, neurological, and renal systems.
  - **APACHE II**: Baseline mortality risk estimation on admission.
  - **NEWS2 (National Early Warning Score)**: Detects early clinical deterioration.
- Live animated ECG waveforms rendered via pure SVG mathematics, calibrated to 60-100 BPM physiological rhythms.

### 3. Bed Management Lifecycle
Beds cycle through four clinical operational states:
1. `OCCUPIED`: Active patient encounter assigned with telemetry streaming.
2. `AVAILABLE`: Bed disinfected and ready for immediate patient admission.
3. `RESERVED`: Held for impending post-operative or emergency transfer.
4. `MAINTENANCE`: Biomedical calibration, terminal cleaning, or sensor repair.

### 4. Enterprise Number & Contact Validation
- **Hotline / Contact Numbers**: Strict Indian 10-digit validation via `validate10DigitPhone`, `clean10DigitPhone`, and standard formatting (`+91 XXXXX XXXXX`). Blocks non-numeric input automatically.
- **Bed Capacities**: Strict integer number string inputs (`type="text"`, `inputMode="numeric"`, `pattern="[0-9]*"`). Enforces logical constraints (`totalICUBeds <= totalBeds`, `min >= 1`).

---

## 📂 6. Directory Structure & File Organization

```
/naimify/ICU/
├── public/                     # Static assets (favicons, high-res logos, hospital badges)
├── src/
│   ├── api/                    # API endpoints and mock HTTP clients
│   ├── assets/                 # Brand assets, SVG icons, and graphics
│   ├── components/             # Reusable UI components
│   │   ├── camera/             # PTZ camera live stream controls
│   │   ├── common/             # Badges, buttons, modals, error boundaries
│   │   ├── layout/             # AppLayout, Navbar, Sidebar, UserProfileDropdown
│   │   ├── patient/            # PatientRegistryModal, vitals dials, triage tags
│   │   └── svg/                # Animated ECG waveforms, clinical timelines
│   ├── data/                   # Clinical mock datasets (patients, beds, audit logs)
│   ├── features/               # Complex domain modals & feature blocks
│   │   └── admin/              # AddHospitalModal, ReportGeneratorModal
│   ├── hooks/                  # Custom React hooks (useDarkMode, usePatient, useResponsive)
│   ├── layouts/                # Route layout containers (DashboardLayout, AuthLayout)
│   ├── pages/                  # Route page components
│   │   ├── admin/              # Super Admin & Hospital Admin consoles (20+ pages)
│   │   ├── auth/               # LoginPage, authentication delegates
│   │   ├── clinical/           # Clinical cockpit prototypes
│   │   ├── doctor/             # Intensivist workflows (7 pages)
│   │   ├── nurse/              # Critical care nurse workflows (7 pages)
│   │   └── public/             # Public landing and information pages
│   ├── services/               # Singleton domain services
│   │   ├── alertService.ts     # Telemetry alarm evaluation and acknowledgement
│   │   ├── authService.ts      # Session management and role resolution
│   │   ├── patientService.ts   # Patient CRUD and acuity calculation
│   │   └── websocket.ts        # Telemetry socket simulation engine
│   ├── store/                  # Redux Toolkit centralized state
│   │   ├── hooks.ts            # Typed useAppDispatch and useAppSelector
│   │   ├── index.ts            # Store configuration and root reducer
│   │   └── slices/             # Redux slices (auth, beds, hospital, patients, logs)
│   ├── types/                  # TypeScript interface definitions (icu.d.ts)
│   ├── utils/                  # Utility functions (validation.ts, formatting.ts)
│   ├── App.tsx                 # Root router configuration with code-splitting
│   ├── index.css               # Design tokens, Tailwind directives, dark mode styling
│   └── main.tsx                # React DOM entry point with Redux Provider
├── package.json                # Project dependencies, scripts, and build configuration
├── tailwind.config.js          # Tailwind theme extensions (colors, keyframe animations)
├── tsconfig.json               # TypeScript compiler configuration (strict mode)
└── vite.config.ts              # Vite bundler plugins, path aliases, server port
```

---

## ⚙️ 7. Getting Started & Development Commands

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` or `v22.x`)
- **Package Manager**: `npm` (v9 or higher)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ajnsih-max/ICU.git

# Enter project root
cd ICU

# Install dependencies
npm install
```

### 3. Available npm Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server at `http://localhost:3000` with hot-module replacement (HMR). |
| `npm run build` | Runs TypeScript compilation (`tsc`) and bundles optimized production assets into `/dist`. |
| `npm test` | Executes unit and integration test suites using **Vitest**. |
| `npm run test:watch` | Runs Vitest in interactive watch mode for active test-driven development. |
| `npm run typecheck` | Executes `tsc --noEmit` to verify type safety across all components and slices without building. |
| `npm run preview` | Spins up a local static server to preview the `/dist` production build bundle. |

---

## 🧪 8. Test Suites & Verification

The project includes unit test coverage across key business logic modules:

```bash
npm test
```

### Test Coverage Highlights
1. **Validation Engine (`src/utils/validation.test.ts`)**:
   - `clean10DigitPhone`: Verification of prefix removal (`+91`, leading `0`), whitespace stripping, and length capping.
   - `isValid10DigitPhone`: Strict regex boundary tests.
   - `validate10DigitPhone`: Required vs optional error string reporting.
   - `format10DigitPhone`: Standard Indian telephone presentation.
   - `Pincode`: 6-digit non-zero Indian postal code validation.
   - `Email`: RFC 5322 compliance and invalid domain rejection.
2. **Authentication State (`src/store/slices/authSlice.test.ts`)**:
   - State initialization and default user resolution.
   - Dynamic role switching between `SUPER_ADMIN`, `ADMIN`, `DIRECTOR`, `DOCTOR`, and `NURSE`.
   - Clean profile naming verification (sanitization of bracketed role titles).
3. **Super Admin Management (`src/store/slices/superAdminSlice.test.ts`)**:
   - Hospital node provisioning and capacity calculations.
   - Doctor and nurse supervisor remark history tracking and audit logging.

---

## 🎨 9. Design System & Responsive Guidelines

- **Clinical Palette**:
  - Primary Teal: `#0F766E` (Clinical Trust & Calm)
  - Dark Teal / Active Border: `#0D655E`
  - Accent Mint: `#10B981` (Normal Physiological State)
  - Warning Amber: `#F59E0B` (Borderline Deterioration)
  - Emergency Rose: `#F43F5E` (Critical Physiological Alert)
  - Canvas Slate: `#0B132B` (Dark Mode High-Contrast Glassmorphism)
- **Responsive & DevTools Inspect Support**:
  - Full support across all screen sizes (mobile viewports 320px–375px up to 4K multi-monitor clinical displays).
  - Main containers enforce `w-full max-w-full overflow-x-hidden` to eliminate horizontal scroll blowout in mobile inspect dimensions.
  - Interactive cards feature responsive wrapping, `break-words`, and touch-friendly targets.

---

## 📄 10. Compliance & Medicolegal Standards

- Designed following guidelines for **ISO 13485** Medical Device Quality Management.
- Built-in audit trail for Indian Digital Personal Data Protection (DPDP) Act compliance.
- Immutable shift handover logs adhering to clinical record retention standards.

---

© 2026 **Naimify Smart ICU Platform**. All rights reserved.
