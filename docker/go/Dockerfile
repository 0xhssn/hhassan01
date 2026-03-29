# ============================================================
#  Go development image
#  Includes: Go toolchain, air (live-reload), golangci-lint,
#            common build tools
# ============================================================

ARG GO_VERSION=1.22
FROM golang:${GO_VERSION}-bookworm

# ---- system dependencies --------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      curl \
      wget \
      ca-certificates \
      build-essential \
      postgresql-client \
      procps \
      jq \
    && rm -rf /var/lib/apt/lists/*

# ---- Go developer tools ---------------------------------
# air — live-reload for Go servers
RUN go install github.com/air-verse/air@latest

# golangci-lint — comprehensive linter
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh \
      | sh -s -- -b /usr/local/bin v1.57.2

# goose — DB migrations
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# mockgen — interface mocks
RUN go install go.uber.org/mock/mockgen@latest

# swag — Swagger doc generator (popular with Gin)
RUN go install github.com/swaggo/swag/cmd/swag@latest

# ---- workspace ------------------------------------------
RUN mkdir -p /workspace \
    && useradd -ms /bin/bash devuser \
    && chown devuser:devuser /workspace

# Keep Go module cache in a named volume (set in compose)
ENV GOPATH=/go \
    GOMODCACHE=/go/pkg/mod \
    CGO_ENABLED=0 \
    GO111MODULE=on \
    PATH="/go/bin:${PATH}"

USER devuser
WORKDIR /workspace

EXPOSE 8080

CMD ["sleep", "infinity"]
