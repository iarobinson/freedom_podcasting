#!/bin/bash
# Run this from the root of your freedom_podcasting repo
# It will restructure the flat files into the correct monorepo layout
# and rename all freedompods/FreedomPods references to freedom_podcasting/FreedomPodcasting

set -e

echo "🎙️  Restructuring freedom_podcasting repo..."

# ── 1. Create directory structure ────────────────────────────────────────────
mkdir -p api/app/controllers/api/v1/auth
mkdir -p api/app/controllers/concerns
mkdir -p api/app/models
mkdir -p api/app/jobs
mkdir -p api/app/mailers
mkdir -p api/app/serializers
mkdir -p api/app/services
mkdir -p api/app/views/public/feeds
mkdir -p api/config/initializers
mkdir -p api/config/environments
mkdir -p api/db/migrate
mkdir -p api/lib
mkdir -p api/spec/models
mkdir -p api/spec/requests
mkdir -p api/spec/support
mkdir -p api/bin
mkdir -p web/src/app/auth
mkdir -p web/src/app/dashboard
mkdir -p web/src/components/ui
mkdir -p web/src/components/layout
mkdir -p web/src/components/podcast
mkdir -p web/src/components/episode
mkdir -p web/src/components/upload
mkdir -p web/src/components/player
mkdir -p web/src/lib
mkdir -p web/src/hooks
mkdir -p web/src/types
mkdir -p web/src/styles
mkdir -p tasks

echo "✓ Directory structure created"

# ── 2. Move flat files into correct locations ─────────────────────────────────
[ -f routes.rb ]          && mv routes.rb          api/config/routes.rb          && echo "  moved routes.rb"
[ -f rss_feed_spec.rb ]   && mv rss_feed_spec.rb   api/spec/requests/rss_feed_spec.rb && echo "  moved rss_feed_spec.rb"
[ -f show.xml.builder ]   && mv show.xml.builder   api/app/views/public/feeds/show.xml.builder && echo "  moved show.xml.builder"
[ -f Gemfile ]            && mv Gemfile            api/Gemfile                   && echo "  moved Gemfile"
[ -f todo.md ]            && mv todo.md            tasks/todo.md                 && echo "  moved todo.md"
[ -f lessons.md ]         && mv lessons.md         tasks/lessons.md              && echo "  moved lessons.md"
[ -f docker-compose.yml ] && echo "  docker-compose.yml already at root ✓"

echo "✓ Files moved to correct locations"

# ── 3. Replace naming using Perl (works identically on macOS and Linux) ───────
echo "  Updating naming in all files..."

find . -type f \( \
  -name "*.rb"   -o -name "*.yml"  -o -name "*.yaml" -o \
  -name "*.md"   -o -name "*.ts"   -o -name "*.tsx"  -o \
  -name "*.js"   -o -name "*.toml" -o -name "*.json" -o \
  -name "Gemfile" \
\) ! -path "./.git/*" ! -path "*/node_modules/*" \
| while read -r file; do
  perl -pi \
    -e 's/FreedomPodsApi/FreedomPodcastingApi/g;' \
    -e 's/FreedomPods\b/FreedomPodcasting/g;' \
    -e 's/freedompods-api/freedom-podcasting-api/g;' \
    -e 's/freedompods-media/freedom-podcasting-media/g;' \
    -e 's/freedompods\.com/freedompodcasting.com/g;' \
    -e 's/freedompods\b/freedom_podcasting/g;' \
    "$file"
done

echo "✓ Naming updated to freedom_podcasting / FreedomPodcasting"

# ── 4. Show resulting structure ───────────────────────────────────────────────
echo ""
echo "✅ Done! Structure:"
find . -not -path './.git/*' -not -path '*/node_modules/*' -not -name '.DS_Store' \
  -maxdepth 4 | sort | head -50

echo ""
echo "Next steps:"
echo "   git add -A"
echo "   git commit -m 'chore: restructure into monorepo layout, fix naming'"
echo "   git push"