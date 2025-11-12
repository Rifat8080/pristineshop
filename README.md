This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Database (PostgreSQL) — local setup

This project expects a PostgreSQL database available via the `DATABASE_URL` environment variable. For local macOS development you can use Homebrew to install PostgreSQL and create a development database.

1. Install PostgreSQL (Homebrew):

	brew install postgresql

2. Start the service (or use `pg_ctl` if you prefer):

	brew services start postgresql

3. Create a database and user (example):

	createuser -s postgres || true
	createdb pristineshop_dev

	# If you want a password-protected user:
	psql -c "CREATE USER appuser WITH PASSWORD 'password';"
	psql -c "GRANT ALL PRIVILEGES ON DATABASE pristineshop_dev TO appuser;"

4. Configure your connection string by copying `.env.example` to `.env.local` and editing the value:

	cp .env.example .env.local

	# or set it in your shell:
	export DATABASE_URL=postgresql://appuser:password@localhost:5432/pristineshop_dev

5. Install Node deps and run the dev server:

	npm install
	npm run dev

6. Test the DB connection quickly by visiting the API route:

	http://localhost:3000/api/hello

The route will attempt a `SELECT 1` and return the result (or an error message) so you can verify the connection.

If you deploy to Vercel or another host, set the `DATABASE_URL` environment variable in the hosting platform.
