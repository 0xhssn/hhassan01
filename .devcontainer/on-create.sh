#!/usr/bin/env bash
# ============================================================
#  devcontainer → onCreateCommand
#  Runs ONCE when the container is first created.
#  Safe to be slow — this is a one-time cost.
# ============================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RESET="\033[0m"

info()    { echo -e "${CYAN}[on-create]${RESET} $*"; }
success() { echo -e "${GREEN}[on-create]${RESET} ✓ $*"; }
warn()    { echo -e "${YELLOW}[on-create]${RESET} ⚠ $*"; }

echo -e "\n${BOLD}╔══════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  Setting up multi-language environment   ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${RESET}\n"

# ---- .env file -------------------------------------------
if [ ! -f /workspace/.env ]; then
  if [ -f /workspace/.env.example ]; then
    info "Creating .env from .env.example …"
    cp /workspace/.env.example /workspace/.env
    success ".env created (edit it with your local values)"
  else
    warn ".env.example not found — skipping .env creation"
  fi
else
  info ".env already exists — skipping"
fi

# ---- Node.js ---------------------------------------------
if [ -f /workspace/package.json ]; then
  info "Installing Node.js dependencies …"
  if [ -f /workspace/pnpm-lock.yaml ]; then
    pnpm install --frozen-lockfile || pnpm install
  elif [ -f /workspace/yarn.lock ]; then
    yarn install --frozen-lockfile || yarn install
  else
    npm ci 2>/dev/null || npm install
  fi
  success "Node.js deps installed"
fi

# ---- Ruby ------------------------------------------------
if [ -f /workspace/Gemfile ]; then
  info "Installing Ruby gems …"
  bundle install
  success "Ruby gems installed"
fi

# ---- Python ----------------------------------------------
if [ -f /workspace/requirements.txt ]; then
  info "Installing Python packages (requirements.txt) …"
  pip install -r /workspace/requirements.txt
  success "Python packages installed"
elif [ -f /workspace/pyproject.toml ]; then
  if command -v poetry &>/dev/null; then
    info "Installing Python packages (poetry) …"
    poetry install --no-interaction
    success "Python packages installed (poetry)"
  fi
elif [ -f /workspace/Pipfile ]; then
  info "Installing Python packages (pipenv) …"
  pipenv install --dev
  success "Python packages installed (pipenv)"
fi

# ---- Go --------------------------------------------------
if [ -f /workspace/go.mod ]; then
  info "Downloading Go modules …"
  go mod download
  go install ./... 2>/dev/null || true
  success "Go modules downloaded"
fi

# ---- Git configuration -----------------------------------
info "Configuring git safe directory …"
git config --global --add safe.directory /workspace

echo -e "\n${GREEN}${BOLD}✅  Environment ready!${RESET}\n"
