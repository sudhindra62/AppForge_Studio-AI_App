# AppForge AI

**A Metadata-Driven AI Application Generator.**

AppForge AI is an enterprise-grade platform that allows users to instantly generate fully-functional, secure SaaS applications without writing code. By dynamically parsing metadata configurations, it automatically provisions Database APIs, User Interfaces, Validation Pipelines, and Web Progressive Apps (PWAs).

---

## 🌟 Key Features

1. **Dynamic Rendering Engine:** Instantly converts JSON/Database metadata into live, interactive React forms and data tables using ShadCN UI and Tailwind CSS.
2. **Dynamic API Runtime:** Exposes secure, multi-tenant REST endpoints (GET, POST, PUT, DELETE) generated dynamically at runtime based on entity definitions.
3. **Advanced EAV Storage Pattern:** Uses a JSONB-backed Entity-Attribute-Value architecture to store limitless custom fields without executing dangerous DDL migrations on Postgres.
4. **Resilient CSV Bulk Imports:** Features a client-side chunking mechanism that parses large datasets in the browser and sequentially uploads them to bypass Serverless function timeouts.
5. **Progressive Web App (PWA):** Fully installable with offline capabilities. A custom Service Worker and IndexedDB queue allow users to submit forms while disconnected, seamlessly syncing them to the cloud in the background upon reconnection.
6. **Multi-Language Support (i18n):** Deep Next.js 15 route localization supporting English, Hindi, and Kannada natively.
7. **Role-Based Access Control (RBAC):** Bulletproof NextAuth v5 middleware protecting Edge routes based on `ADMIN` and `USER` roles.

---

## 📚 Documentation Index

Everything you need to understand, run, and scale this project is documented in the `/docs` folder:

### Architecture & Design
- [System Design & Engines](docs/architecture/SYSTEM_DESIGN.md)
- [Database & Multi-tenancy Architecture](docs/architecture/DATABASE.md)
- [Dynamic API Reference](docs/architecture/API_REFERENCE.md)

### Interview Preparation (For Reviewers)
- [Technical Explanation Notes](docs/interview_prep/EXPLANATION_NOTES.md)
- [Architectural Tradeoffs & Edge Cases](docs/interview_prep/TRADEOFFS_EDGE_CASES.md)
- [Future Scalability Plan](docs/interview_prep/SCALABILITY_PLAN.md)
- [Loom Presentation Script](docs/interview_prep/LOOM_SCRIPT.md)

### Deployment & Operations
- [Vercel & Neon Deployment Guide](docs/deployment/VERCEL_NEON_GUIDE.md)
- [User Guide](docs/guides/USER_GUIDE.md)
- [Admin Guide](docs/guides/ADMIN_GUIDE.md)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- PostgreSQL (Local or Neon Serverless)

### 1. Install Dependencies
```bash
npm install
npm install cmdk next-themes lucide-react # Required for the new UI shell
```

### 2. Environment Variables
Copy the `.env.example` file to `.env` and fill in your database and NextAuth credentials.
```bash
cp .env.example .env
```

### 3. Database Setup
Ensure you are using Prisma v6.7.0 (required for multi-file schema support).
```bash
npx prisma generate --schema=prisma/schema
npx prisma db push --schema=prisma/schema
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.
