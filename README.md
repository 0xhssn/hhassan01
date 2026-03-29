### Hi there, I'm Hamza Hassan 👋  
_A software (read: **Product**) engineer living one git-commit at a time._

With over 5 years of experience, I specialize in building and deploying software solutions in AI, blockchain, and Web3. 
From designing secure backend systems to creating seamless user interfaces, I’m passionate about crafting high-quality software. 
Skilled in event-driven architecture, cloud infrastructure, and smart contract development, I thrive in collaborative environments and enjoy learning new technologies.

---
<div align="center">

### 🛠 My Skill Set

  
| **Languages**     | **Frameworks**      | **Cloud**       | **Databases**  |
|-------------------|---------------------|-----------------|----------------|
| TypeScript        | Next.js (React)     | AWS             | PostgreSQL     |
| JavaScript        | Node.js (NestJS)    | Serverless      | MySQL          |
| Ruby              | Ruby on Rails       | Kubernetes      | MongoDB        |
| Python            | Gatsby              | CI/CD pipelines | Amazon RDS     |
| GO                | Gin                 |                 |                |
| GraphQL           |                     |                 |                |

</div>

---

### 📫 Get in Touch
- **LinkedIn:** [hhssnn](https://www.linkedin.com/in/hhssnn)
- **Email:** hassanhamza0101@gmail.com

Feel free to reach out if you want to connect or collaborate on exciting projects!

---

## 🚀 Development Environment Setup

This repository ships two complementary approaches to get a **fully reproducible** environment in minutes — pick whichever fits your workflow.

---

### Option A — VS Code / GitHub Codespaces devcontainer

A single, all-in-one container with every runtime pre-installed.

| Requirement | Version |
|---|---|
| VS Code | any recent |
| [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) | latest |
| Docker Desktop | 4.x + |

```bash
# 1. Clone
git clone https://github.com/hhssnn/hhssnn.git
cd hhssnn

# 2. Open in VS Code, then when prompted:
#    "Reopen in Container"  ← click this
#    (or: Cmd/Ctrl+Shift+P → "Dev Containers: Reopen in Container")
```

> **GitHub Codespaces**: push to GitHub → *Code → Codespaces → New codespace*. No local Docker required.

The container auto-runs `.devcontainer/on-create.sh` on first boot to install dependencies and create a `.env` from `.env.example`.

---

### Option B — Docker Compose (all services)

Isolated containers per language, sharing a PostgreSQL + Redis backbone.

#### Prerequisites

| Tool | Version |
|---|---|
| Docker | 24 + |
| Docker Compose | v2 (bundled with Docker Desktop) |

#### Quick start

```bash
# 1. Clone & enter
git clone https://github.com/hhssnn/hhssnn.git
cd hhssnn

# 2. Configure environment
cp .env.example .env
# Edit .env — set secrets, API keys, etc.

# 3. Start everything
docker compose up --build

# — or start a single service —
docker compose up node     # Node.js (port 3000)
docker compose up ruby     # Rails   (port 3001)
docker compose up python   # Python  (port 8000)
docker compose up go       # Gin     (port 8080)
```

#### Open a shell in any service

```bash
docker compose exec node   bash   # Node.js
docker compose exec ruby   bash   # Ruby
docker compose exec python bash   # Python
docker compose exec go     bash   # Go
```

#### Port reference

| Service | Host port | Framework |
|---|---|---|
| `node` | 3000 | NestJS API / Next.js |
| `ruby` | 3001 | Ruby on Rails |
| `python` | 8000 | FastAPI / Gatsby preview |
| `go` | 8080 | Gin HTTP server |
| `postgres` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |

#### Teardown

```bash
docker compose down          # stop containers, keep volumes
docker compose down -v       # stop + delete all data volumes
```

---

### Runtime versions

| Runtime | Version | Manager |
|---|---|---|
| Node.js | 20 LTS | nvm / corepack |
| Ruby | 3.3 | rbenv |
| Python | 3.12 | pyenv |
| Go | 1.22 | official tarball |
| PostgreSQL | 16 | Docker image |
| Redis | 7 | Docker image |

> Versions are controlled by build args in `docker-compose.yml` and `.devcontainer/devcontainer.json` — bump a single value to upgrade.

---

### Repository layout

```
.
├── .devcontainer/
│   ├── Dockerfile          # all-in-one devcontainer image
│   ├── devcontainer.json   # VS Code / Codespaces config
│   ├── on-create.sh        # first-boot dependency installer
│   └── post-start.sh       # welcome banner on every start
├── docker/
│   ├── node/Dockerfile     # Node.js 20 service image
│   ├── ruby/Dockerfile     # Ruby 3.3 service image
│   ├── python/Dockerfile   # Python 3.12 service image
│   └── go/Dockerfile       # Go 1.22 service image
├── docker-compose.yml      # orchestrates all services
├── .env.example            # environment variable template
└── .gitignore
```
