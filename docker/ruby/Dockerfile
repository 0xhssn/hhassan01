# ============================================================
#  Ruby development image
#  Includes: Ruby, Bundler, Rails CLI, PostgreSQL client,
#            Node.js (for asset pipeline / Webpacker)
# ============================================================

ARG RUBY_VERSION=3.3
FROM ruby:${RUBY_VERSION}-slim-bookworm

# ---- system dependencies --------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      curl \
      wget \
      ca-certificates \
      gnupg \
      build-essential \
      libpq-dev \
      libssl-dev \
      libreadline-dev \
      libyaml-dev \
      libffi-dev \
      libgmp-dev \
      zlib1g-dev \
      postgresql-client \
      procps \
      jq \
    && rm -rf /var/lib/apt/lists/*

# ---- Node.js (required by Rails asset pipeline) ---------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

# ---- Bundler & Rails ------------------------------------
# Use a specific bundler to ensure reproducibility
RUN gem install bundler --no-document \
    && gem install rails --no-document

# ---- workspace ------------------------------------------
RUN mkdir -p /workspace /bundle \
    && useradd -ms /bin/bash devuser \
    && chown -R devuser:devuser /workspace /bundle

USER devuser
WORKDIR /workspace

# Bundle install path (matches BUNDLE_PATH env in compose)
ENV BUNDLE_PATH=/bundle \
    GEM_HOME=/bundle \
    PATH="/bundle/bin:${PATH}"

EXPOSE 3001

CMD ["sleep", "infinity"]
