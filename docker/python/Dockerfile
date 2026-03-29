# ============================================================
#  Python development image
#  Includes: Python 3, pip, pipenv, poetry, virtualenv,
#            Node.js (Gatsby requires node), common tooling
# ============================================================

ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim-bookworm

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
      libffi-dev \
      postgresql-client \
      procps \
      jq \
    && rm -rf /var/lib/apt/lists/*

# ---- Node.js (required by Gatsby) -----------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn gatsby-cli \
    && rm -rf /var/lib/apt/lists/*

# ---- Python package managers & common tools -------------
RUN pip install --upgrade pip setuptools wheel \
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

# ---- workspace ------------------------------------------
RUN mkdir -p /workspace \
    && useradd -ms /bin/bash devuser \
    && chown devuser:devuser /workspace

USER devuser
WORKDIR /workspace

ENV PYTHONPATH=/workspace \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["sleep", "infinity"]
