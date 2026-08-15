# Cattle Valley

Premium, responsive website for Cattle Valley, built with Next.js App Router, TypeScript, Framer Motion, React Hook Form, Prisma, and PostgreSQL.

## Start locally

1. Copy `.env.example` to `.env` and configure PostgreSQL.
2. Install packages: `npm.cmd install`
3. Generate the client: `npm.cmd run db:generate`
4. Push the schema: `npm.cmd run db:push`
5. Run: `npm.cmd run dev`

## Architecture

- `app/` — routed pages, SEO, sitemap, and robots
- `components/` — visual site primitives and landing-page sections
- `lib/` — data client
- `prisma/` — CMS data model for posts, hubs, media, FAQs, documents, and users
- `public/images/` — supplied brand asset

## Production checklist

Set the environment variables in Vercel, provision a PostgreSQL database, run the Prisma migration, and connect NextAuth plus Cloudinary/UploadThing credentials. Configure the `NEXTAUTH_SECRET` as a long random value. The admin route is a UI foundation; protect it with NextAuth middleware before publishing CMS controls.

Remote editorial photography is currently loaded from Unsplash for prototype purposes. Replace it with optimised, licensed assets uploaded to your preferred image provider before launch.
