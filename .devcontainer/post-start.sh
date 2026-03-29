#!/usr/bin/env bash
# ============================================================
#  devcontainer → postStartCommand
#  Runs every time the container starts (including rebuilds).
#  Should be fast — print a friendly welcome banner.
# ============================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
MAGENTA="\033[0;35m"
RESET="\033[0m"

echo -e "\n${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Multi-Language Dev Environment — Ready!    ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${RESET}\n"

# ---- Runtime versions ------------------------------------
echo -e "${BOLD}Runtime versions:${RESET}"

node_v=$(node  --version 2>/dev/null || echo "not found")
npm_v=$(npm    --version 2>/dev/null || echo "not found")
pnpm_v=$(pnpm  --version 2>/dev/null || echo "not found")
ruby_v=$(ruby  --version 2>/dev/null | awk '{print $2}' || echo "not found")
python_v=$(python --version 2>/dev/null | awk '{print $2}' || echo "not found")
go_v=$(go version 2>/dev/null | awk '{print $3}' | sed 's/go//' || echo "not found")

printf "  ${CYAN}%-12s${RESET} %s  (npm %s, pnpm %s)\n" "Node.js" "$node_v" "$npm_v" "$pnpm_v"
printf "  ${MAGENTA}%-12s${RESET} %s\n" "Ruby" "$ruby_v"
printf "  ${BLUE}%-12s${RESET} %s\n" "Python" "$python_v"
printf "  ${YELLOW}%-12s${RESET} %s\n" "Go" "$go_v"

# ---- Useful port reference --------------------------------
echo -e "\n${BOLD}Dev server ports:${RESET}"
echo -e "  ${CYAN}http://localhost:3000${RESET}  →  Node.js  (NestJS / Next.js)"
echo -e "  ${MAGENTA}http://localhost:3001${RESET}  →  Ruby     (Rails)"
echo -e "  ${BLUE}http://localhost:8000${RESET}  →  Python   (FastAPI / Gatsby)"
echo -e "  ${YELLOW}http://localhost:8080${RESET}  →  Go       (Gin)"

# ---- Quick tips -------------------------------------------
echo -e "\n${BOLD}Quick tips:${RESET}"
echo -e "  docker compose up          # start all services"
echo -e "  docker compose up node     # start a single service"
echo -e "  docker compose run --rm node bash  # open a shell"
echo -e "  bash .devcontainer/on-create.sh    # re-run setup"
echo ""
