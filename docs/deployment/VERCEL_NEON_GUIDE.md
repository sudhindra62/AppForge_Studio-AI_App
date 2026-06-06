# Vercel & Neon PostgreSQL Deployment Guide

Deploying AppForge AI to production is a seamless process leveraging Vercel's Edge infrastructure and Neon's Serverless Postgres.

## 1. Database Setup (Neon)

Since AppForge heavily utilizes connection pooling (especially during CSV imports), Neon is the ideal database.

1. Go to [Neon.tech](https://neon.tech) and create a new project.
2. Under your project settings, locate the **Connection String**.
3. *Crucial Step*: Ensure you copy the **Pooled Connection String** (usually looks like `postgres://user:pass@ep-rest-of-host-pooler.region.aws.neon.tech/neondb`).
4. Append `?pgbouncer=true` to the end of the URL to tell Prisma to operate in PgBouncer mode.

## 2. GitHub Preparation

1. Push your local repository to a new private GitHub repository.
2. Ensure `package.json` contains the `postinstall` script:
   `"postinstall": "prisma generate --schema=prisma/schema"`

## 3. Vercel Deployment

1. Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the **Environment Variables** section, add the following exactly:
   - `DATABASE_URL` -> (Your Neon Pooled Connection String from Step 1)
   - `NEXTAUTH_SECRET` -> (Generate a random 32-character string)
   - `NEXTAUTH_URL` -> (Leave blank for Vercel, it auto-detects, or set to your actual production domain)
4. Set the **Build Command** to: `npm run build`
5. Click **Deploy**.

## 4. Run Initial Migrations

Because Prisma migrations (`prisma db push` or `prisma migrate deploy`) should *not* be run through a connection pooler, you must do this locally against the direct database URL.

1. On your local machine, change your `.env` `DATABASE_URL` to the **Direct Connection String** from Neon.
2. Run: `npx prisma db push --schema=prisma/schema`
3. Your production database is now ready to receive data from your Vercel deployment!
