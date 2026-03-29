# ============================================================
#  All-in-one devcontainer image
#  Runtimes: Node.js 20 · Ruby 3.3 · Python 3.12 · Go 1.22
#
#  Built on the Microsoft universal base image which already
#  ships common tooling (git, zsh, oh-my-zsh, nvm, sdkman…).
#  We layer each language runtime on top.
# ============================================================

FROM mcr.microsoft.com/devcontainers/base:bookworm

# ---- build args (bump here to upgrade a runtime) --------
ARG NODE_VERSION=20
ARG RUBY_VERSION=3.3.0
ARG PYTHON_VERSION=3.12
ARG GO_VERSION=1.22.4

# ============================================================
# System packages
# ============================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
      # build essentials
      build-essential \
      pkg-config \
      # crypto / SSL
      libssl-dev \
      libffi-dev \
      # Ruby native ext deps
      libreadline-dev \
      libyaml-dev \
      libgdbm-dev \
      libgmp-dev \
      libncurses5-dev \
      # DB clients
      libpq-dev \
      postgresql-client \
      # misc tooling
      curl \
      wget \
      unzip \
      git \
      jq \
      procps \
      zsh \
    && rm -rf /var/lib/apt/lists/*

# ============================================================
# Node.js — via NodeSource (LTS)
# ============================================================
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    # enable corepack (pnpm / yarn)
    && corepack enable && corepack prepare pnpm@latest --activate \
    # global CLIs
    && npm install -g \
         typescript \
         ts-node \
         @nestjs/cli \
         create-next-app \
         eslint \
         prettier \
         nodemon \
         concurrently \
         dotenv-cli \
         gatsby-cli

# ============================================================
# Ruby — via rbenv
# ============================================================
ENV RBENV_ROOT=/usr/local/rbenv
ENV PATH="${RBENV_ROOT}/bin:${RBENV_ROOT}/shims:${PATH}"

RUN git clone --depth=1 https://github.com/rbenv/rbenv.git ${RBENV_ROOT} \
    && git clone --depth=1 https://github.com/rbenv/ruby-build.git ${RBENV_ROOT}/plugins/ruby-build \
    # build & install Ruby
    && rbenv install ${RUBY_VERSION} \
    && rbenv global ${RUBY_VERSION} \
    && rbenv rehash \
    # gems
    && gem install bundler rails --no-document \
    && rbenv rehash

# ============================================================
# Python — via pyenv
# ============================================================
ENV PYENV_ROOT=/usr/local/pyenv
ENV PATH="${PYENV_ROOT}/bin:${PYENV_ROOT}/shims:${PATH}"

RUN git clone --depth=1 https://github.com/pyenv/pyenv.git ${PYENV_ROOT} \
    && pyenv install ${PYTHON_VERSION} \
    && pyenv global ${PYTHON_VERSION} \
    && pyenv rehash \
    # upgrade pip and install common tools
    && pip install --upgrade pip setuptools wheel \
    && pip install \
         pipenv \
         poetry \
         virtualenv \
         black \
         ruff \
         mypy \
         ipython \
         httpie \
         pytest \
         pytest-cov

# ============================================================
# Go — official tarball
# ============================================================
ENV GOROOT=/usr/local/go
ENV GOPATH=/home/vscode/go
ENV PATH="${GOROOT}/bin:${GOPATH}/bin:${PATH}"

RUN ARCH="$(dpkg --print-architecture)" \
    && case "${ARCH}" in \
         amd64) GOARCH=amd64 ;; \
         arm64|aarch64) GOARCH=arm64 ;; \
         *) echo "Unsupported arch: ${ARCH}" && exit 1 ;; \
       esac \
    && curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${GOARCH}.tar.gz" \
         -o /tmp/go.tar.gz \
    && tar -C /usr/local -xzf /tmp/go.tar.gz \
    && rm /tmp/go.tar.gz \
    # Go developer tools
    && go install github.com/air-verse/air@latest \
    && go install go.uber.org/mock/mockgen@latest \
    && go install github.com/pressly/goose/v3/cmd/goose@latest \
    && go install github.com/swaggo/swag/cmd/swag@latest \
    # golangci-lint
    && curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh \
         | sh -s -- -b /usr/local/bin v1.57.2

# ============================================================
# Final tweaks for the "vscode" user (uid 1000)
# ============================================================
RUN mkdir -p ${GOPATH} /home/vscode/.config \
    && chown -R vscode:vscode ${GOPATH} /home/vscode/.config

# Make rbenv & pyenv work for non-root user
RUN chmod -R a+rx ${RBENV_ROOT} ${PYENV_ROOT}

# ---- shell init -----------------------------------------
# Append runtime PATH exports to both bash and zsh profiles
RUN printf '\n# ---- devcontainer runtime paths ----\n\
export RBENV_ROOT=%s\n\
export PYENV_ROOT=%s\n\
export GOROOT=%s\n\
export GOPATH=%s\n\
export PATH="%s/bin:%s/shims:%s/bin:%s/shims:%s/bin:%s/bin:$PATH"\n' \
    "${RBENV_ROOT}" "${PYENV_ROOT}" "${GOROOT}" "${GOPATH}" \
    "${RBENV_ROOT}" "${RBENV_ROOT}" \
    "${PYENV_ROOT}" "${PYENV_ROOT}" \
    "${GOROOT}" "${GOPATH}" \
    >> /etc/bash.bashrc \
    && cp /etc/bash.bashrc /etc/zsh/zshenv 2>/dev/null || true

USER vscode
WORKDIR /workspace
