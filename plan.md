# Civic Issue Reporter Functional Upgrade Plan

## Goal
Make the app fully functional as **Civic Issue Reporter** with the updated MongoDB Atlas URL, redesigned UI, S3 issue photo uploads, safe CORS behavior, Docker support, and EC2 + Nginx deployment readiness.

## Current Assumptions
- The project has a React frontend in `frontend/`.
- The project has an Express + MongoDB backend in `backend/`.
- MongoDB Atlas connection details should come from environment variables, not hard-coded source code.
- Issue photos should be uploaded to S3 and stored on complaint records as durable public or signed-access URLs.
- The deployed frontend will call the backend through Nginx, preferably through `/api`.

## Phase 1: Repository Safety Check
- Check current git status and identify files already modified by you.
- Review existing frontend redesign files without overwriting your changes.
- Review backend package/config files to preserve your updated MongoDB URL handling.
- Confirm whether `plan.md` is the only file changed before implementation begins.

## Phase 2: Branding and UI Functional Review
- Replace remaining old names such as `Smart City Portal`, `Nagar Nigam`, or old deployment references with `Civic Issue Reporter`.
- Keep the redesigned UI intact and only fix broken imports, labels, routes, and API wiring.
- Confirm login, registration, dashboard, complaint list, community complaints, complaint detail, and new issue report pages still render.
- Verify the new complaint form sends backend-compatible category values.
- Ensure uploaded image previews work before submission.

## Phase 3: MongoDB Atlas Configuration
- Use a single backend DB connection path.
- Read the database URI from `MONGODB_URI`.
- Remove hard-coded Atlas credentials from source files.
- Add or update `.env.example` with required database variables.
- Verify the backend starts and connects to the configured Atlas database.
- Verify health endpoint reports MongoDB connection state.

## Phase 4: S3 Issue Photo Uploads
- Add S3 upload dependencies if missing.
- Configure required environment variables:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET_NAME`
  - Optional: `S3_PUBLIC_BASE_URL`
- Replace local disk upload storage with memory upload handling.
- Upload issue photos to S3 during complaint creation.
- Store each image as an object containing:
  - `url`
  - `key`
  - `bucket`
  - `originalName`
  - `mimeType`
  - `size`
- Keep image count and file size limits.
- Return useful validation errors for unsupported image types or failed uploads.

## Phase 5: CORS and API Routing
- Configure CORS from environment variables instead of hard-coded production URLs.
- Support comma-separated allowed origins through `CORS_ORIGINS`.
- Include local development origins:
  - `http://localhost:3000`
  - `http://localhost:5173`
  - `http://localhost:5000`
- Support EC2/Nginx production origin.
- Ensure preflight `OPTIONS` requests work.
- Ensure credentials and `Authorization` headers are allowed.
- Prefer same-origin production calls through Nginx `/api` to reduce CORS problems.

## Phase 6: Docker Readiness
- Add backend Dockerfile.
- Add frontend Dockerfile or production Nginx image for React build.
- Add `.dockerignore` files to avoid copying `node_modules`, logs, and env secrets.
- Add `docker-compose.yml` for local or EC2 deployment.
- Pass backend secrets through `.env`, not image builds.
- Verify containers start cleanly.
- Verify frontend can reach backend from Docker networking.

## Phase 7: Nginx and EC2 Deployment Readiness
- Add example Nginx config.
- Serve React static build from Nginx.
- Proxy `/api` requests to backend.
- Add `client_max_body_size` large enough for image uploads.
- Add SPA fallback to `index.html`.
- Include placeholders for domain, SSL, and backend upstream.
- Document expected EC2 environment variables.

## Phase 8: Verification Checklist
- Run backend dependency install if needed.
- Run frontend dependency install if needed.
- Start backend locally and verify:
  - `/health`
  - `/api/auth`
  - `/api/complaints`
- Start frontend locally and verify:
  - login page
  - registration page
  - dashboard route
  - new complaint form
- Submit a test issue with photos.
- Confirm the complaint is saved in MongoDB Atlas.
- Confirm photos appear in S3.
- Confirm saved complaint image URLs render in frontend.
- Build frontend production bundle.
- Build Docker images.
- Run Docker Compose.
- Test Nginx proxy path `/api/health`.

## Phase 9: Deliverables
- Updated frontend branding and functional UI fixes.
- Updated backend configuration and CORS handling.
- S3 upload integration for issue photos.
- MongoDB Atlas env-based connection.
- Docker and Nginx deployment files.
- `.env.example` files with no secrets.
- Final verification report listing commands run and results.

## Open Items To Confirm Before Implementation
- Final production domain or EC2 public URL for `CORS_ORIGINS`.
- Whether S3 images should be public URLs or private objects with signed URLs.
- Maximum image size per issue photo.
- Whether Docker Compose should include MongoDB locally or only connect to Atlas.
