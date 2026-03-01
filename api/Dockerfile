FROM ruby:3.3.0-slim

# Retry apt in case of transient mirror failures
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      libpq-dev \
      curl \
      libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /rails

COPY Gemfile Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3

COPY . .

RUN bundle exec bootsnap precompile app/ lib/ 2>/dev/null || true

RUN useradd rails --create-home --shell /bin/bash && \
    chown -R rails:rails /rails
USER rails

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
