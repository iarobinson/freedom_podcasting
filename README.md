# FreedomPodcasting

Podcast hosting and AI-powered production platform.

## Stack
- **API**: Ruby on Rails 7.1 (API mode) + PostgreSQL + Sidekiq
- **Web**: Next.js 14 + TypeScript + Tailwind CSS
- **Storage**: Cloudflare R2 (zero egress fees)
- **Hosting**: Fly.io
- **Mobile**: React Native / Expo (Phase 4)

## Project Structure
```
freedom_podcasting/
├── api/          # Rails API backend
├── web/          # Next.js frontend
├── mobile/       # Expo React Native (Phase 4)
├── tasks/
│   ├── todo.md   # Project plan + progress
│   └── lessons.md # Lessons learned
└── docker-compose.yml
```

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Ruby 3.3.0 (for local Rails development without Docker)
- Node.js 22+

### 1. Clone and configure
```bash
git clone <repo>
cd freedom_podcasting
cp api/.env.example api/.env
# Edit api/.env with your R2 credentials
```

### 2. Start with Docker Compose
```bash
docker-compose up
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Rails API on http://localhost:3000
- Sidekiq worker
- Next.js on http://localhost:3001

### 3. Or run locally without Docker

**API:**
```bash
cd api
bundle install
cp .env.example .env  # fill in values
rails db:create db:migrate db:seed
rails server
```

**Worker:**
```bash
cd api
bundle exec sidekiq
```

**Web:**
```bash
cd web
npm install
npm run dev
```

## Environment Variables

See `api/.env.example` for all required variables.

### Required for Phase 1:
- `DATABASE_URL` — PostgreSQL connection string
- `DEVISE_JWT_SECRET_KEY` — Run `rails secret` to generate
- `SECRET_KEY_BASE` — Run `rails secret` to generate
- `R2_ACCESS_KEY_ID` — Cloudflare R2 API key
- `R2_SECRET_ACCESS_KEY` — Cloudflare R2 secret
- `R2_ENDPOINT` — `https://<account_id>.r2.cloudflarestorage.com`
- `R2_BUCKET` — Your R2 bucket name
- `R2_PUBLIC_URL` — Public CDN URL for your R2 bucket

## Cloudflare R2 Setup

1. Create a Cloudflare account at cloudflare.com
2. Go to R2 → Create bucket → name it `freedom-podcasting-media`
3. Create an API token with R2 read/write permissions
4. Enable public access on the bucket (or set up a custom domain)
5. Copy credentials to your `.env`

## Fly.io Deployment

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and create apps
fly auth login
fly launch --name freedom-podcasting-api --region sjc

# Set secrets
fly secrets set DEVISE_JWT_SECRET_KEY=$(openssl rand -hex 64)
fly secrets set SECRET_KEY_BASE=$(openssl rand -hex 64)
fly secrets set DATABASE_URL=<your-postgres-url>
fly secrets set REDIS_URL=<your-redis-url>
fly secrets set R2_ACCESS_KEY_ID=<value>
fly secrets set R2_SECRET_ACCESS_KEY=<value>
fly secrets set R2_ENDPOINT=<value>
fly secrets set R2_BUCKET=freedom-podcasting-media
fly secrets set R2_PUBLIC_URL=<value>

# Deploy
fly deploy
```

## RSS Feed

Your podcast RSS feed is available at:
```
https://api.freedompodcasting.com/feeds/{podcast-slug}
```

This URL is compatible with Apple Podcasts, Spotify, Google Podcasts, and all major directories.

## Running Tests

```bash
cd api
bundle exec rspec spec/requests/rss_feed_spec.rb  # RSS feed tests
bundle exec rspec                                   # All tests
```

## Architecture Notes

### Multi-tenancy
Every resource is scoped to an `Organization`. Users can belong to multiple organizations with different roles (`owner`, `admin`, `editor`, `viewer`).

### Direct Uploads
Audio files never touch the Rails server. The flow is:
1. Browser requests a presigned URL from Rails API
2. Browser uploads file directly to Cloudflare R2
3. Browser notifies Rails that upload is complete
4. Rails queues `ProcessAudioJob` to extract duration/metadata

### RSS Feed
The RSS feed at `/feeds/:slug` is unauthenticated and cached. It conforms to:
- RSS 2.0 spec
- iTunes Podcast RSS spec
- Podcast Index namespace (future-proofing)
