# backendserver

To install dependencies:

```bash
bun install
```

To generate the Prisma client:

```bash
bunx prisma generate
```

To run in development:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Required service configuration

The backend now keeps third-party secrets server-side. Configure these environment variables before enabling the corresponding features:

- `OPEN_ROUTER_API_KEY` and optional `OPEN_ROUTER_MODEL` for AI product descriptions.
- `RESEND_API_KEY` and `RESEND_FROM` for verification, password-reset, and order-status emails.
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` for product-image uploads.

The frontend only needs `VITE_BACKEND_URL` and `VITE_ADMIN_WHATSAPP_NUMBER`.
